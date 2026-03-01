// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom'
import { isOnboarded } from '../App'
import './Landing.css'

export default function Landing() {
  const navigate = useNavigate()
  // Read fresh each render — not captured in a stale closure
  const alreadyOnboarded = isOnboarded()

  function handleStart() {
    // Navigate to dashboard if already set up, otherwise go to signup
    navigate(alreadyOnboarded ? '/dashboard' : '/signup')
  }

  return (
    <div className="landing-page">
      {/* Background decoration */}
      <div className="landing-blob landing-blob-1" />
      <div className="landing-blob landing-blob-2" />

      {/* Nav */}
      <nav className="landing-nav">
        <span className="landing-nav-logo">🌿 Emotional Companion</span>
        {alreadyOnboarded && (
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/dashboard')}>
            Go to Dashboard →
          </button>
        )}
      </nav>

      {/* Hero */}
      <main className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">🌿 Your AI Wellness Companion</div>

          <h1 className="landing-title">
            A companion that truly
            <span className="landing-title-accent"> listens.</span>
          </h1>

          <p className="landing-sub">
            Daily check-ins, emotional insights, voice conversations, and a future self that guides you — all in one calm, private space.
          </p>

          <div className="landing-actions">
            <button className="btn btn-primary btn-lg landing-cta" onClick={handleStart}>
              Start My Journey 🌿
            </button>
            <p className="landing-cta-note">Free to start · No credit card required</p>
          </div>

          {/* Features grid */}
          <div className="landing-features">
            {[
              { icon: '💬', title: 'Companion Chat', desc: 'Text your thoughts anytime and get warm, personalized responses.' },
              { icon: '🎙', title: 'Voice Check-ins', desc: 'Speak naturally and receive emotional reflections in real time.' },
              { icon: '📞', title: 'Daily Calls', desc: 'AI phone calls at your chosen time to keep you accountable.' },
              { icon: '✨', title: 'Future Self', desc: 'Chat with a wiser version of you from 5 years ahead.' },
            ].map((f) => (
              <div key={f.title} className="landing-feature-card">
                <span className="landing-feature-icon">{f.icon}</span>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative preview card */}
        <div className="landing-preview">
          <div className="landing-preview-card">
            <div className="landing-preview-header">
              <span className="landing-preview-dot green" />
              <span className="landing-preview-dot yellow" />
              <span className="landing-preview-dot red" />
              <span className="landing-preview-title">Companion Chat</span>
            </div>
            <div className="landing-preview-messages">
              <div className="landing-preview-msg assistant">
                Hi Alex 👋 How are you feeling today?
              </div>
              <div className="landing-preview-msg user">
                A bit stressed about work, honestly.
              </div>
              <div className="landing-preview-msg assistant">
                I hear you. Work stress can feel heavy. What's the main thing weighing on you right now?
              </div>
              <div className="landing-preview-msg user">
                Just a lot of deadlines piling up.
              </div>
              <div className="landing-preview-summary">
                <span className="landing-preview-summary-tag">Mood: stressed</span>
                <span className="landing-preview-summary-tag">💡 Try a 2-min breathing reset</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
