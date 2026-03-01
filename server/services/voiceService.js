const axios = require('axios');

const ELEVEN_BASE_URL = 'https://api.elevenlabs.io/v1';

async function generateSpeech(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required and must be a string');
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');
  if (!voiceId) throw new Error('ELEVENLABS_VOICE_ID not configured');

  try {
    const response = await axios.post(
      `${ELEVEN_BASE_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.7
        }
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 12000
      }
    );

    return Buffer.from(response.data).toString('base64');

  } catch (error) {
    const status = error.response?.status;

    if (status === 402) {
      throw new Error('ElevenLabs plan required or credits exhausted.');
    }

    if (status === 401) {
      throw new Error('Invalid ElevenLabs API key.');
    }

    if (status === 404) {
      throw new Error('Invalid ElevenLabs voice ID.');
    }

    throw new Error('ElevenLabs API request failed.');
  }
}

async function getAvailableVoices() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  try {
    const response = await axios.get(
      `${ELEVEN_BASE_URL}/voices`,
      {
        headers: { 'xi-api-key': apiKey },
        timeout: 8000
      }
    );

    return response.data.voices || [];

  } catch {
    throw new Error('Failed to fetch voices.');
  }
}

/**
 * Stream TTS audio in Twilio-compatible u-law 8k chunks.
 * @param {Object} params
 * @param {string} params.text - Text to synthesize
 * @param {(chunk: Buffer) => void|Promise<void>} params.onAudioChunk - Callback for each audio chunk
 * @param {() => boolean} [params.shouldStop] - Optional cancellation signal
 */
async function streamSpeech({ text, onAudioChunk, shouldStop }) {
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required and must be a string');
  }

  if (typeof onAudioChunk !== 'function') {
    throw new Error('onAudioChunk callback is required');
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');
  if (!voiceId) throw new Error('ELEVENLABS_VOICE_ID not configured');

  const url =
    `${ELEVEN_BASE_URL}/text-to-speech/${voiceId}/stream` +
    '?output_format=ulaw_8000';

  const response = await axios.post(
    url,
    {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.7
      }
    },
    {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      responseType: 'stream',
      timeout: 30000
    }
  );

  for await (const chunk of response.data) {
    if (typeof shouldStop === 'function' && shouldStop()) {
      response.data.destroy();
      break;
    }
    if (chunk && chunk.length) {
      await onAudioChunk(Buffer.from(chunk));
    }
  }
}

module.exports = {
  generateSpeech,
  getAvailableVoices,
  streamSpeech
};
