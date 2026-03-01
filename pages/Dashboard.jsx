// src/pages/Dashboard.jsx - Minimal version to test
import { getUserName } from '../App'

export default function Dashboard() {
  const userName = getUserName()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #C7EABB 0%, #E8F8D8 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1a1a1a', margin: '0 0 0.5rem 0' }}>
          Hi {userName} 👋
        </h1>
        <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        maxWidth: '600px'
      }}>
        <h2 style={{ color: '#2d5016', fontSize: '1.5rem', marginTop: 0 }}>🎙️ Voice Check-in</h2>
        <p style={{ color: '#666' }}>Test voice recording feature</p>
        <button style={{
          background: '#C7EABB',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '1rem',
          color: '#2d5016'
        }}>
          🎤 Start Recording
        </button>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        maxWidth: '600px',
        marginTop: '1.5rem'
      }}>
        <h2 style={{ color: '#2d5016', fontSize: '1.5rem', marginTop: 0 }}>💬 Chat</h2>
        <p style={{ color: '#666' }}>Talk with your AI companion</p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        maxWidth: '600px',
        marginTop: '1.5rem'
      }}>
        <h2 style={{ color: '#2d5016', fontSize: '1.5rem', marginTop: 0 }}>📊 Insights</h2>
        <p style={{ color: '#666' }}>View your emotional patterns</p>
      </div>
    </div>
  )
}
