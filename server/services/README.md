# Services Documentation

This folder contains business logic services that encapsulate specific functionality, keeping routes clean and focused on HTTP handling.

## File Structure

```
services/
├── geminiService.js      # Google Gemini AI API integration
└── voiceService.js       # ElevenLabs voice synthesis (placeholder)
```

## Services Overview

### geminiService.js

Handles all interactions with Google's Gemini API for content generation and analysis.

**Functions:**

- `testGemini()` - Test API connection
  - Returns a simple greeting to verify the API is working
  - Throws error if `GEMINI_API_KEY` is not set

- `analyzeTranscript(transcript)` - Analyze user input with Gemini
  - Identifies emotional mood (one word)
  - Generates empathetic response
  - Suggests a micro-action step
  - Returns: `{ mood, response, micro_action }`

**Error Handling:**

- Validates API key presence
- Validates transcript input
- Parses JSON responses carefully
- Throws descriptive errors for debugging

### voiceService.js

Placeholder for future ElevenLabs text-to-speech integration.

**Planned Functions:**

- `generateSpeech(text, voiceId)` - Convert text to audio
- `getAvailableVoices()` - Fetch available voice options

**Note:** Currently raises "not yet implemented" errors. Will be developed when ElevenLabs API key is available.

## How to Use in Routes

```javascript
const geminiService = require("./services/geminiService");

// In a route handler:
const reply = await geminiService.testGemini();
const analysis = await geminiService.analyzeTranscript(userInput);
```

## Adding New Services

1. Create a new file: `services/newService.js`
2. Write clean, async functions with clear documentation
3. Export functions using `module.exports`
4. Import in `server.js` and use in routes

## Best Practices

✅ **DO:**

- Keep services focused on a single responsibility
- Use async/await for cleaner code
- Add JSDoc comments explaining function purpose
- Handle errors explicitly
- Validate input parameters

❌ **DON'T:**

- Expose Express (req, res) to services
- Mix business logic with HTTP handling
- Import services in other services (keep it flat)
- Ignore error handling

## Testing

Each service function can be tested independently:

```javascript
const service = require("./services/geminiService");

// Test in isolation
await service.testGemini();
```

This makes unit testing easier and keeps code maintainable.
