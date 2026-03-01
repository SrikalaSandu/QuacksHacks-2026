require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const db = require('./firebase');
const llmService = require('./services/llmService');
const voiceService = require('./services/voiceService');

const app = express();
const PORT = process.env.PORT || 5000;

// Required for Twilio webhook payload parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.set('trust proxy', true);

const audioStore = new Map();
const AUDIO_TTL_MS = 2 * 60 * 1000;
const conversationStore = new Map();
const CONVERSATION_TTL_MS = 30 * 60 * 1000;
const MAX_CONVERSATION_TURNS = 12;
const chatSessionStore = new Map();
const CHAT_SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_CHAT_TURNS = 20;

const cleanupInterval = setInterval(() => {
  const now = Date.now();

  for (const [callSid, item] of audioStore.entries()) {
    if (now - item.createdAt > AUDIO_TTL_MS) {
      audioStore.delete(callSid);
    }
  }

  for (const [callSid, item] of conversationStore.entries()) {
    if (now - item.updatedAt > CONVERSATION_TTL_MS) {
      conversationStore.delete(callSid);
    }
  }

  for (const [sessionId, item] of chatSessionStore.entries()) {
    if (now - item.updatedAt > CHAT_SESSION_TTL_MS) {
      chatSessionStore.delete(sessionId);
    }
  }
}, 30000);
cleanupInterval.unref();

function getPublicBaseUrl(req) {
  const fromEnv = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  return `${req.protocol}://${req.get('host')}`;
}

function getConversationHistory(callSid) {
  const state = conversationStore.get(callSid);
  return state?.history || [];
}

function appendConversationTurn(callSid, role, text) {
  if (!callSid || !text) return;
  const state = conversationStore.get(callSid) || { history: [], updatedAt: Date.now() };
  state.history.push({ role, text: String(text).trim() });
  if (state.history.length > MAX_CONVERSATION_TURNS) {
    state.history = state.history.slice(-MAX_CONVERSATION_TURNS);
  }
  state.updatedAt = Date.now();
  conversationStore.set(callSid, state);
}

async function generateSpeechAndReturnUrl(aiReply, callSid, req) {
  const audioBase64 = await voiceService.generateSpeech(aiReply);
  if (!audioBase64 || typeof audioBase64 !== 'string') {
    throw new Error('Voice service returned empty audio payload');
  }

  const audioBuffer = Buffer.from(audioBase64, 'base64');
  if (!audioBuffer.length) {
    throw new Error('Generated audio buffer is empty');
  }

  audioStore.set(callSid, {
    buffer: audioBuffer,
    createdAt: Date.now()
  });

  const baseUrl = getPublicBaseUrl(req);
  return `${baseUrl}/twilio-audio?callSid=${encodeURIComponent(callSid)}&t=${Date.now()}`;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

function createSessionId() {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getChatHistory(sessionId) {
  const session = chatSessionStore.get(sessionId);
  return session?.history || [];
}

function appendChatTurn(sessionId, role, text) {
  if (!sessionId || !text) return;
  const session = chatSessionStore.get(sessionId) || { history: [], updatedAt: Date.now() };
  session.history.push({ role, text: String(text).trim() });
  if (session.history.length > MAX_CHAT_TURNS) {
    session.history = session.history.slice(-MAX_CHAT_TURNS);
  }
  session.updatedAt = Date.now();
  chatSessionStore.set(sessionId, session);
}

app.post('/chat', async (req, res) => {
  const message = String(req.body?.message || '').trim();
  const providedSessionId = String(req.body?.sessionId || req.get('x-session-id') || '').trim();
  const sessionId = providedSessionId || createSessionId();

  if (!message) {
    return res.status(400).json({
      reply: 'Please share a message so I can respond.',
      sessionId
    });
  }

  try {
    appendChatTurn(sessionId, 'user', message);

    const reply = await llmService.generateConversationalReply({
      transcript: message,
      history: getChatHistory(sessionId)
    });

    appendChatTurn(sessionId, 'assistant', reply);

    return res.json({
      reply,
      sessionId
    });
  } catch (error) {
    console.error('chat route failed:', error);
    return res.status(200).json({
      reply: "I'm still here with you... something glitched for a second. Try again?",
      sessionId
    });
  }
});

app.post('/voice', (req, res) => {
  console.log('VOICE HIT');
  const VoiceResponse = require('twilio').twiml.VoiceResponse;
  const twiml = new VoiceResponse();
  const retry = req.query.retry;

  if (!retry) {
    twiml.say(
      { voice: 'alice' },
      "Hey... it's Shinchan. I'm here with you. Tell me what's been on your mind."
    );
  }

  twiml.gather({
    input: 'speech',
    action: '/process-speech',
    method: 'POST',
    speechTimeout: 'auto',
    timeout: 6,
    language: 'en-US'
  });

  res.type('text/xml');
  return res.send(twiml.toString());
});

app.post('/process-speech', async (req, res) => {
  console.log('PROCESS SPEECH HIT');
  const VoiceResponse = require('twilio').twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  try {
    const transcript = String(req.body.SpeechResult || '').trim();
    const callSid = String(req.body.CallSid || '').trim() || `unknown-${Date.now()}`;

    if (!transcript) {
      twiml.say("I didn't quite catch that... can you say it again?");
      twiml.redirect('/voice?retry=1');
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    appendConversationTurn(callSid, 'user', transcript);

    const aiReply = await llmService.generateConversationalReply({
      transcript,
      history: getConversationHistory(callSid)
    });

    appendConversationTurn(callSid, 'assistant', aiReply);

    let audioUrl;
    try {
      audioUrl = await generateSpeechAndReturnUrl(aiReply, callSid, req);
    } catch (ttsError) {
      console.error('ElevenLabs failed:', ttsError);
      twiml.say(aiReply);
      twiml.redirect('/voice?retry=1');
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    db.collection('voice_calls').add({
      callSid,
      transcript,
      response: aiReply,
      conversation_turns: getConversationHistory(callSid),
      timestamp: new Date()
    }).catch(console.error);

    twiml.play(audioUrl);
    twiml.redirect('/voice?retry=1');

    res.type('text/xml');
    return res.send(twiml.toString());
  } catch (error) {
    console.error('process-speech failed:', error);
    twiml.say("Something went wrong, but I'm still here with you.");
    twiml.redirect('/voice?retry=1');
    res.type('text/xml');
    return res.send(twiml.toString());
  }
});

app.get('/twilio-audio', (req, res) => {
  const callSid = String(req.query.callSid || '').trim();
  if (!callSid) {
    return res.status(400).send('callSid is required');
  }

  const item = audioStore.get(callSid);
  if (!item) {
    return res.status(404).send('Audio not found');
  }

  if (Date.now() - item.createdAt > AUDIO_TTL_MS) {
    audioStore.delete(callSid);
    return res.status(404).send('Audio expired');
  }

  res.set('Content-Type', 'audio/mpeg');
  res.set('Cache-Control', 'no-store');
  return res.send(item.buffer);
});

app.post('/generate-speech', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }
    const audio = await voiceService.generateSpeech(text);
    return res.json({ success: true, audio });
  } catch (error) {
    return next(error);
  }
});

app.post('/call-me', async (req, res) => {
  try {
    const client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }

    const call = await client.calls.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.PUBLIC_BASE_URL}/voice`,
      method: 'POST'
    });

    return res.json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error('Call initiation error:', error);
    return res.status(500).json({ error: 'Failed to initiate call' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
