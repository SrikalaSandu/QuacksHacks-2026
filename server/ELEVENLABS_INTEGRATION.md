## ElevenLabs Integration Example

Add these to your `.env` file:

```env
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
```

### Using in Routes

```javascript
const voiceService = require('./services/voiceService');

// Generate speech from text
app.post('/generate-speech', async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const audioBase64 = await voiceService.generateSpeech(text);
    
    res.json({ 
      success: true, 
      audio: audioBase64 
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Get available voices
app.get('/voices', async (req, res, next) => {
  try {
    const voices = await voiceService.getAvailableVoices();
    res.json({ voices });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
```

### Playing Audio in Client

```javascript
// Audio is returned as base64 string
const response = await fetch('/generate-speech', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello world' })
});

const { audio } = await response.json();

// Play audio
const audioElement = new Audio(`data:audio/mpeg;base64,${audio}`);
audioElement.play();
```

### Error Handling

These errors are tracked automatically:
- Missing API key
- Missing voice ID
- Invalid text input
- API connection failures
- Invalid API responses

All throw descriptive error messages caught by Express error handler.
