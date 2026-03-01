// src/pages/Signup.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setOnboarded, getUserId } from '../App'
import '../Landing.css'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSignup(e) {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    // Setup user locally
    getUserId()
    setOnboarded(name.trim())
    
    // Navigate to dashboard immediately - no async/await needed
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="landing-page">
      <div className="landing-blob landing-blob-1" />
      <div className="landing-blob landing-blob-2" />

      <nav className="landing-nav">
        <span className="landing-nav-logo">🌿 Emotional Companion</span>
      </nav>

      <main className="landing-hero" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="landing-hero-content">
          <h1 className="landing-title">Welcome! 👋</h1>
          <p className="landing-sub">Let's get you started on your emotional wellness journey.</p>

          <form onSubmit={handleSignup} style={{ marginTop: '30px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                What's your name?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder="Enter your name"
                className="input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '15px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={!name.trim()}
              style={{ marginBottom: '15px' }}
            >
              Start My Journey 🌿
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginTop: '20px' }}>
            No payment required · Your data is private
          </p>
        </div>
      </main>
    </div>
  )
}
