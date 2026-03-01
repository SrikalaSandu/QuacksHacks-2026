// mockData.js
// Frontend mock data for dashboard development

export const mockUser = {
  userId: 'user_12345',
  name: 'Friend',
  phoneNumber: '+1 (555) 123-4567',
  goals: [
    'Practice daily gratitude',
    'Improve sleep quality',
    'Reduce work stress'
  ],
  habits: [
    'Morning meditation',
    'Evening reflection',
    'Weekly goal review'
  ],
  checkInTime: '09:00 AM',
  timezone: 'EST'
}

export const mockCheckins = [
  {
    id: 'checkin_1',
    userId: 'user_12345',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    mood: 'great',
    transcript: 'Had a really productive day. Finished the project ahead of schedule.',
    mode: 'browser_voice',
    completionStatus: 'completed',
    mood_detected: 'great',
    micro_action: 'Take a 10-minute walk to celebrate',
    completion_question: 'How will you celebrate this win?'
  },
  {
    id: 'checkin_2',
    userId: 'user_12345',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    mood: 'good',
    transcript: 'Feeling mostly good, but a bit tired from meetings.',
    mode: 'chat',
    completionStatus: 'completed',
    mood_detected: 'good',
    micro_action: 'Spend 5 minutes in nature',
    completion_question: 'What would help you feel more energized?'
  },
  {
    id: 'checkin_3',
    userId: 'user_12345',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    mood: 'okay',
    transcript: 'Regular day, nothing special.',
    mode: 'quick',
    completionStatus: 'completed',
    mood_detected: 'okay',
    micro_action: 'Journal for 3 minutes',
    completion_question: 'What would make tomorrow better?'
  },
  {
    id: 'checkin_4',
    userId: 'user_12345',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    mood: 'low',
    transcript: 'Struggling with motivation today.',
    mode: 'browser_voice',
    completionStatus: 'completed',
    mood_detected: 'low',
    micro_action: 'Call a friend or loved one',
    completion_question: 'Who could you reach out to?'
  },
  {
    id: 'checkin_5',
    userId: 'user_12345',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
    mood: 'stressed',
    transcript: 'Multiple deadlines and feeling overwhelmed.',
    mode: 'chat',
    completionStatus: 'completed',
    mood_detected: 'stressed',
    micro_action: 'Do a 2-minute breathing exercise',
    completion_question: 'What deadline is most urgent?'
  }
]

export const moodFrequency = {
  great: 1,
  good: 1,
  okay: 1,
  low: 1,
  stressed: 1
}

export const completionRate = 0.95

export const conversationHistory = [
  {
    id: 'msg_1',
    role: 'assistant',
    content: 'Hi Friend 👋 How are you feeling today?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: 'msg_2',
    role: 'user',
    content: 'I\'ve been having a pretty good day actually!',
    timestamp: new Date(Date.now() - 1000 * 60 * 28)
  },
  {
    id: 'msg_3',
    role: 'assistant',
    content: 'That\'s wonderful to hear! 😊 What made today special?',
    timestamp: new Date(Date.now() - 1000 * 60 * 27)
  }
]
