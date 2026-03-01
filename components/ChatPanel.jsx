// components/ChatPanel.jsx
import { useState, useEffect, useRef } from 'react'
import './ChatPanel.css'

export default function ChatPanel({ isFutureMode = false, onModeChange }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg_1',
      role: 'assistant',
      content: isFutureMode
        ? '✨ Hello from your Future Self! I\'ve learned so much in 5 years. How can I guide you today?'
        : 'Hi there! 👋 I\'m here to listen. What\'s on your mind today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // TODO: Replace with actual backend call
      // const response = await analyzeInteraction({
      //   mode: isFutureMode ? 'future' : 'chat',
      //   message: inputValue.trim()
      // })

      // Mock response for now
      const mockResponses = [
        'That sounds really important. Tell me more about how that makes you feel.',
        'I appreciate you sharing that with me. Have you thought about what might help?',
        'It\'s completely normal to feel that way. What\'s one small step you could take today?',
        'Thank you for opening up. Remember, progress over perfection.'
      ]

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]

      const assistantMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`chat-panel ${isFutureMode ? 'future-mode' : ''}`}>
      <div className="chat-header">
        <div>
          <h3 className="chat-title">
            {isFutureMode ? '✨ Future Self Chat' : '💬 Companion Chat'}
          </h3>
          <p className="chat-subtitle">
            {isFutureMode ? 'Chat with your future self from 5 years ahead' : 'Always here to listen'}
          </p>
        </div>
        {!isFutureMode && (
          <button
            className="future-btn"
            onClick={() => onModeChange?.(!isFutureMode)}
            title="Talk to Future Self"
          >
            ✨
          </button>
        )}
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-bubble">
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Type your thoughts here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={2}
          disabled={isLoading}
        />
        <button
          className="chat-send-btn"
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          title="Send message (Shift+Enter for new line)"
        >
          →
        </button>
      </div>
    </div>
  )
}
