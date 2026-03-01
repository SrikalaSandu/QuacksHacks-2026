// components/VoiceCheckinCard.jsx
import { useState, useRef } from 'react'
import './VoiceCheckinCard.css'

export default function VoiceCheckinCard({ onCheckinComplete }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const recognitionRef = useRef(null)

  // Initialize Web Speech API
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in your browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptSegment + ' ')
        } else {
          interim += transcriptSegment
        }
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      initializeSpeechRecognition()
    }
    setTranscript('')
    setResult(null)
    recognitionRef.current?.start()
  }

  const handleStopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const handleSendForAnalysis = async () => {
    if (!transcript.trim()) return

    setIsLoading(true)
    try {
      // TODO: Replace with actual backend call
      // const response = await analyzeInteraction({
      //   mode: 'browser_voice',
      //   transcript: transcript.trim()
      // })

      // Mock response for now
      const mockResponse = {
        mood: 'positive',
        response: 'That sounds wonderful! I\'m glad you\'re feeling good. Remember to celebrate these moments.',
        micro_action: 'Take a 10-minute walk outside',
        completion_question: 'What made today special?'
      }

      setResult(mockResponse)
      onCheckinComplete?.({
        mode: 'browser_voice',
        transcript: transcript.trim(),
        ...mockResponse
      })
    } catch (error) {
      console.error('Error analyzing interaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="voice-checkin-card card">
      <div className="voice-header">
        <h2 className="voice-title">🎙️ Start Voice Check-in</h2>
        <p className="voice-subtitle">Speak your thoughts freely</p>
      </div>

      <div className="voice-controls">
        {!isListening ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleStartListening}
            disabled={isLoading}
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            className="btn btn-danger btn-lg"
            onClick={handleStopListening}
          >
            ⏹️ Stop Recording
          </button>
        )}
      </div>

      {transcript && (
        <div className="transcript-preview">
          <p className="transcript-label">Live transcript:</p>
          <div className="transcript-text">{transcript}</div>
        </div>
      )}

      {transcript && !isLoading && (
        <button
          className="btn btn-secondary btn-full"
          onClick={handleSendForAnalysis}
        >
          Send for Analysis ✓
        </button>
      )}

      {isLoading && (
        <div className="loading-state">
          <span className="spinner"></span> Analyzing...
        </div>
      )}

      {result && (
        <div className="analysis-result">
          <div className="result-section">
            <h3>AI Response</h3>
            <p>{result.response}</p>
          </div>
          <div className="result-grid">
            <div className="result-item">
              <label>Mood Detected</label>
              <p className="result-value">{result.mood}</p>
            </div>
            <div className="result-item">
              <label>Micro Action</label>
              <p className="result-value">{result.micro_action}</p>
            </div>
          </div>
          <div className="result-question">
            <p><strong>Reflection:</strong> {result.completion_question}</p>
          </div>
        </div>
      )}
    </div>
  )
}
