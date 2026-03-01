let WebSocket = null;
try {
  WebSocket = require('ws');
} catch {
  WebSocket = null;
}
const db = require('./firebase');
const llmService = require('./services/llmService');
const voiceService = require('./services/voiceService');

const sessions = new Map();
const MAX_CONVERSATION_TURNS = 12;
const PARTIAL_LOG_DEBOUNCE_MS = 1500;
const TTS_FALLBACK_TEXT = "I'm here, I didn't catch that - could you repeat?";
const SILENCE_RESPONSE_DELAY_MS = 650;
const FALLBACK_COOLDOWN_MS = 15000;

function detectEmotionTags(text) {
  const t = String(text || '').toLowerCase();
  const tags = new Set();

  if (/\banxious|panic|overwhelm|nervous|worried|fear\b/.test(t)) tags.add('anxiety');
  if (/\bsad|cry|alone|lonely|down|hopeless|empty\b/.test(t)) tags.add('sadness');
  if (/\bangry|mad|frustrat|irritat|upset\b/.test(t)) tags.add('anger');
  if (/\bstress|stressed|pressure|burnout|exhausted|tired\b/.test(t)) tags.add('stress');
  if (/\bguilt|ashamed|regret\b/.test(t)) tags.add('guilt');
  if (/\bconfused|stuck|lost\b/.test(t)) tags.add('confusion');

  return Array.from(tags);
}

function mergeEmotionTags(session, tags) {
  for (const tag of tags) {
    session.emotionScores.set(tag, (session.emotionScores.get(tag) || 0) + 1);
  }
}

function topEmotionTags(session, limit = 3) {
  return Array.from(session.emotionScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

function getDominantEmotion(session) {
  return topEmotionTags(session, 1)[0] || 'unknown';
}

function inferToneStyleFromEmotion(emotion) {
  if (emotion === 'sadness') return 'calm and soothing';
  if (emotion === 'anxiety' || emotion === 'stress') return 'grounded and steady';
  if (emotion === 'anger') return 'steady and non-reactive';
  if (emotion === 'guilt' || emotion === 'confusion') return 'gentle and clarifying';
  return 'warm and steady';
}

function buildLocalEmpatheticFallback(session, transcript) {
  const emotion = session.dominantEmotion || 'unknown';
  const userText = String(transcript || '').replace(/\s+/g, ' ').trim();
  const lead = userText
    ? `I hear how heavy this feels for you right now.`
    : `I can feel this is hard to carry right now.`;

  if (emotion === 'anxiety' || emotion === 'stress') {
    return `${lead} We can stay with one part of it together. What feels most intense in this moment?`;
  }
  if (emotion === 'sadness') {
    return `${lead} You do not have to hold this alone right now. What feels the hardest part to say out loud?`;
  }
  if (emotion === 'anger') {
    return `${lead} Your reaction makes sense given the pressure you are under. What has been weighing on you the most today?`;
  }
  return `${lead} I am with you and listening closely. What part of this matters most to you right now?`;
}

function logStreamEvent(callSid, payload) {
  db.collection('voice_stream_logs').add({
    callSid,
    timestamp: new Date(),
    ...payload
  }).catch(console.error);
}

function appendTurn(session, role, text) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return;

  session.history.push({ role, text: normalized });
  if (session.history.length > MAX_CONVERSATION_TURNS) {
    session.history = session.history.slice(-MAX_CONVERSATION_TURNS);
  }
}

function chunkBuffer(buffer, size) {
  const output = [];
  for (let offset = 0; offset < buffer.length; offset += size) {
    output.push(buffer.subarray(offset, Math.min(offset + size, buffer.length)));
  }
  return output;
}

function sendTwilioMedia(session, audioBuffer) {
  if (!session || !session.ws || session.ws.readyState !== 1) return;
  if (!session.streamSid) return;

  for (const frame of chunkBuffer(audioBuffer, 640)) {
    const event = {
      event: 'media',
      streamSid: session.streamSid,
      media: {
        payload: frame.toString('base64')
      }
    };
    session.ws.send(JSON.stringify(event));
  }
}

function clearTwilioBufferedAudio(session) {
  if (!session || !session.ws || session.ws.readyState !== 1 || !session.streamSid) return;
  session.ws.send(JSON.stringify({
    event: 'clear',
    streamSid: session.streamSid
  }));
}

async function speakToCaller(session, text, classification = 'assistant_response') {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return;

  const speechToken = ++session.speechToken;
  session.isSpeaking = true;

  try {
    await voiceService.streamSpeech({
      text: normalized,
      shouldStop: () => speechToken !== session.speechToken,
      onAudioChunk: async (chunk) => {
        if (speechToken !== session.speechToken) return;
        sendTwilioMedia(session, chunk);
      }
    });

    logStreamEvent(session.callSid, {
      type: 'assistant_tts_stream',
      utterance_classification: classification,
      text: normalized
    });
    session.lastAssistantText = normalized;
    session.lastAssistantAt = Date.now();
  } catch (error) {
    console.error('TTS stream failed:', error.message);
    logStreamEvent(session.callSid, {
      type: 'tts_error',
      utterance_classification: 'system_fallback',
      error: error.message
    });

    const preRecordedFallback = process.env.PRE_RECORDED_FALLBACK_BASE64_ULAW;
    if (preRecordedFallback) {
      sendTwilioMedia(session, Buffer.from(preRecordedFallback, 'base64'));
      return;
    }

    // Last resort: try once with a short fallback text.
    if (normalized !== TTS_FALLBACK_TEXT && speechToken === session.speechToken) {
      await speakToCaller(session, TTS_FALLBACK_TEXT, 'system_fallback');
    }
  } finally {
    if (speechToken === session.speechToken) {
      session.isSpeaking = false;
    }
  }
}

async function streamAssistantReply(session, transcript) {
  if (session.isResponding || !transcript) return;
  session.isResponding = true;

  try {
    let finalReply = await llmService.generateConversationalReply({
      transcript,
      history: session.history,
      emotionalContext: topEmotionTags(session),
      emotionalTrajectory: session.emotionalTrajectory.slice(-6),
      dominantEmotion: session.dominantEmotion,
      lastAssistantToneStyle: session.lastAssistantToneStyle
    });
    finalReply = String(finalReply || '').replace(/\s+/g, ' ').trim();

    if (finalReply) {
      if (finalReply === session.lastAssistantText) {
        finalReply = `${finalReply} What feels most important for me to understand right now?`;
      }
      await speakToCaller(session, finalReply, 'assistant_response');
      appendTurn(session, 'assistant', finalReply);
      logStreamEvent(session.callSid, {
        type: 'assistant_text_final',
        utterance_classification: 'assistant_response',
        text: finalReply
      });
    } else {
      const now = Date.now();
      if (!session.lastFallbackAt || (now - session.lastFallbackAt) >= FALLBACK_COOLDOWN_MS) {
        session.lastFallbackAt = now;
        await speakToCaller(session, buildLocalEmpatheticFallback(session, transcript), 'system_fallback');
      }
    }
  } catch (error) {
    console.error('LLM reply failed:', error.message);
    logStreamEvent(session.callSid, {
      type: 'llm_error',
      utterance_classification: 'system_fallback',
      error: error.message
    });
    const now = Date.now();
    if (!session.lastFallbackAt || (now - session.lastFallbackAt) >= FALLBACK_COOLDOWN_MS) {
      session.lastFallbackAt = now;
      await speakToCaller(session, buildLocalEmpatheticFallback(session, transcript), 'system_fallback');
    }
  } finally {
    session.isResponding = false;
  }
}

function setupDeepgramSession(session) {
  if (!WebSocket) {
    session.transcriberReady = false;
    logStreamEvent(session.callSid, {
      type: 'transcriber_unavailable',
      utterance_classification: 'system_state',
      error: '`ws` package is not installed'
    });
    return;
  }

  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramApiKey) {
    session.transcriberReady = false;
    logStreamEvent(session.callSid, {
      type: 'transcriber_unavailable',
      utterance_classification: 'system_state',
      error: 'DEEPGRAM_API_KEY not configured'
    });
    return;
  }

  const deepgramUrl =
    'wss://api.deepgram.com/v1/listen' +
    '?encoding=mulaw&sample_rate=8000&channels=1&interim_results=true' +
    '&punctuate=true&endpointing=400';

  const dg = new WebSocket(deepgramUrl, {
    headers: {
      Authorization: `Token ${deepgramApiKey}`
    }
  });

  dg.on('open', () => {
    session.transcriberReady = true;
    logStreamEvent(session.callSid, {
      type: 'transcriber_ready',
      utterance_classification: 'system_state'
    });
  });

  dg.on('message', async (rawMessage) => {
    let message;
    try {
      message = JSON.parse(rawMessage.toString());
    } catch {
      return;
    }

    if (message.type !== 'Results') return;

    const transcript = message.channel?.alternatives?.[0]?.transcript?.trim();
    if (!transcript) return;

    const isFinal = Boolean(message.is_final || message.speech_final);
    const now = Date.now();

    if (!isFinal) {
      if (session.isSpeaking && transcript.length >= 12) {
        session.speechToken += 1;
        session.isSpeaking = false;
        clearTwilioBufferedAudio(session);
        logStreamEvent(session.callSid, {
          type: 'barge_in_interrupt',
          utterance_classification: 'user_interrupt',
          text: transcript
        });
      }

      if (now - session.lastPartialLogAt >= PARTIAL_LOG_DEBOUNCE_MS) {
        session.lastPartialLogAt = now;
        logStreamEvent(session.callSid, {
          type: 'transcript_partial',
          utterance_classification: 'user_partial',
          text: transcript
        });
      }
      return;
    }

    if (transcript === session.lastFinalTranscript) {
      return;
    }
    session.lastFinalTranscript = transcript;

    appendTurn(session, 'user', transcript);
    const tags = detectEmotionTags(transcript);
    mergeEmotionTags(session, tags);
    session.dominantEmotion = getDominantEmotion(session);
    session.emotionalTrajectory.push(session.dominantEmotion);
    if (session.emotionalTrajectory.length > 12) {
      session.emotionalTrajectory = session.emotionalTrajectory.slice(-12);
    }
    session.lastAssistantToneStyle = inferToneStyleFromEmotion(session.dominantEmotion);

    logStreamEvent(session.callSid, {
      type: 'transcript_final',
      utterance_classification: 'user_utterance',
      text: transcript,
      emotion_tags: tags,
      top_emotions: topEmotionTags(session),
      dominant_emotion: session.dominantEmotion,
      emotional_trajectory: session.emotionalTrajectory.slice(-6),
      assistant_tone_style: session.lastAssistantToneStyle
    });

    session.pendingFinalTranscript = session.pendingFinalTranscript
      ? `${session.pendingFinalTranscript} ${transcript}`
      : transcript;

    if (session.responseTimer) {
      clearTimeout(session.responseTimer);
    }

    session.responseTimer = setTimeout(() => {
      const pending = session.pendingFinalTranscript;
      session.pendingFinalTranscript = '';
      session.responseTimer = null;
      if (pending && !session.isResponding) {
        streamAssistantReply(session, pending).catch((error) => {
          logStreamEvent(session.callSid, {
            type: 'assistant_response_error',
            utterance_classification: 'system_fallback',
            error: error.message
          });
        });
      }
    }, SILENCE_RESPONSE_DELAY_MS);
  });

  dg.on('close', () => {
    session.transcriberReady = false;
    logStreamEvent(session.callSid, {
      type: 'transcriber_closed',
      utterance_classification: 'system_state'
    });
  });

  dg.on('error', (error) => {
    session.transcriberReady = false;
    logStreamEvent(session.callSid, {
      type: 'transcriber_error',
      utterance_classification: 'system_fallback',
      error: error.message
    });
  });

  session.deepgramWs = dg;
}

function startSession(callSid, context) {
  const existing = sessions.get(callSid);
  if (existing) {
    existing.ws = context.ws || existing.ws;
    existing.streamSid = context.streamSid || existing.streamSid;
    existing.updatedAt = Date.now();
    return existing;
  }

  const session = {
    callSid,
    ws: context.ws,
    streamSid: context.streamSid,
    history: [],
    deepgramWs: null,
    transcriberReady: false,
    isResponding: false,
    isSpeaking: false,
    speechToken: 0,
    lastFinalTranscript: '',
    lastAssistantText: '',
    lastAssistantAt: 0,
    lastFallbackAt: 0,
    lastPartialLogAt: 0,
    pendingFinalTranscript: '',
    responseTimer: null,
    emotionScores: new Map(),
    dominantEmotion: 'unknown',
    emotionalTrajectory: [],
    lastAssistantToneStyle: 'warm and steady',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  sessions.set(callSid, session);
  setupDeepgramSession(session);

  logStreamEvent(callSid, {
    type: 'session_start',
    utterance_classification: 'system_state'
  });

  return session;
}

function processAudioChunk(callSid, audioFrameB64) {
  const session = sessions.get(callSid);
  if (!session || !audioFrameB64) return;

  session.updatedAt = Date.now();
  if (!session.deepgramWs || session.deepgramWs.readyState !== 1) return;

  try {
    const audioBuffer = Buffer.from(audioFrameB64, 'base64');
    session.deepgramWs.send(audioBuffer);
  } catch (error) {
    logStreamEvent(callSid, {
      type: 'audio_process_error',
      utterance_classification: 'system_fallback',
      error: error.message
    });
  }
}

function endSession(callSid) {
  const session = sessions.get(callSid);
  if (!session) return;

  if (session.responseTimer) {
    clearTimeout(session.responseTimer);
    session.responseTimer = null;
  }

  try {
    if (session.deepgramWs && session.deepgramWs.readyState === 1) {
      session.deepgramWs.close();
    }
  } catch (error) {
    console.error('Error closing transcriber socket:', error.message);
  }

  logStreamEvent(callSid, {
    type: 'session_end',
    utterance_classification: 'system_state',
    duration_ms: Date.now() - session.createdAt,
    turn_count: session.history.length,
    top_emotions: topEmotionTags(session)
  });

  sessions.delete(callSid);
}

function handleTwilioStreamConnection(ws) {
  let callSid = null;

  ws.on('message', async (rawData) => {
    let event;
    try {
      event = JSON.parse(rawData.toString());
    } catch {
      return;
    }

    switch (event.event) {
      case 'start': {
        const streamSid = event.start?.streamSid || null;
        callSid =
          event.start?.callSid ||
          event.start?.customParameters?.CallSid ||
          streamSid;

        if (!callSid) return;

        startSession(callSid, { ws, streamSid });
        break;
      }
      case 'media': {
        if (!callSid) return;
        processAudioChunk(callSid, event.media?.payload);
        break;
      }
      case 'stop': {
        if (callSid) endSession(callSid);
        break;
      }
      default:
        break;
    }
  });

  ws.on('close', () => {
    if (callSid) endSession(callSid);
  });

  ws.on('error', (error) => {
    if (callSid) {
      logStreamEvent(callSid, {
        type: 'twilio_socket_error',
        utterance_classification: 'system_fallback',
        error: error.message
      });
      endSession(callSid);
    }
  });
}

module.exports = {
  handleTwilioStreamConnection,
  startSession,
  processAudioChunk,
  endSession
};
