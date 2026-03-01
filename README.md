🧠💚 MindMate
Your AI Emotional Companion

MindMate is an AI-powered emotional companion that chats, listens, and even calls you when you need support. It helps you track moods, build habits, pursue goals, and even talk to a future version of yourself — turning reflection into real personal growth.

Built for QuacksHacks 2026 🚀

✨ Features
💬 AI Chat Companion

Real-time conversational AI

Emotion-aware responses

Provides compassionate micro-actions

Displays structured feedback:

Mood

Micro-action

Reflection question

📞 Voice Call Support

Call MindMate anytime

AI listens to your voice

Responds with generated voice feedback

Uses Twilio for phone call handling

Converts AI responses to speech using ElevenLabs

🎙 Browser Voice Check-ins

Speak directly from the browser

Web Speech API transcription

AI analysis of emotional state

🔮 Future Self Mode

Talk with a future version of yourself

Encouragement framed from a long-term growth perspective

Switch modes inside the dashboard

📊 Emotional Insights Dashboard

Mood tracking

Completion rate tracking

Habit and goal alignment

Recent activity logs

Call status overview

🏗 Tech Stack
🎨 Frontend

HTML

CSS

JavaScript

React (Vite)

Responsive mobile-first design

⚙ Backend

Node.js

Express.js

🤖 AI & Voice APIs

GPT-4.0 API (OpenAI)
→ Emotional analysis + structured JSON responses

Twilio API
→ Handles phone calls & voice input

ElevenLabs API
→ Converts AI-generated text responses into realistic voice

🗄 Database

Firebase Firestore

Users collection

Check-ins

Memory summaries

Optional chat history

📂 Project Structure
frontend/
  ├── src/
  │   ├── pages/
  │   ├── components/
  │   ├── lib/
backend/
  ├── server.js
  ├── routes/
  ├── services/
🔄 System Architecture Flow
Chat / Browser Check-in Flow

User inputs text or voice.

Frontend sends data to /analyze (Node/Express).

Backend calls GPT-4.0 API.

GPT returns structured JSON:

mood

response

micro_action

completion_question

Response returned to frontend.

Data saved in Firestore.

Phone Call Flow

User calls Twilio number.

Twilio captures speech.

Backend sends transcript to GPT-4.0.

GPT response sent to ElevenLabs.

ElevenLabs generates voice audio.

Twilio plays AI response back to user.

🚀 How to Run Locally
Frontend
npm install
npm run dev
Backend
cd backend
npm install
node server.js
🔐 Environment Variables

Create a .env file:

OPENAI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
ELEVENLABS_API_KEY=
FIREBASE_CONFIG=
🌱 Vision

MindMate aims to bridge the gap between AI and emotional growth by:

Providing accessible support anytime

Encouraging daily reflection

Reinforcing healthy habits

Turning insight into action

Unlike simple chatbots, MindMate combines:

Text chat

Voice chat

Phone calls

Future-self perspective

Data-driven emotional insights

🧩 Future Improvements

Full authentication system

Push notifications for daily check-ins

Advanced analytics & visualizations

Personalized long-term growth insights

Mobile app version

🏆 Built For

QuacksHacks 2026
