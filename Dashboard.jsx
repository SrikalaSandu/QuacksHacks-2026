// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import ChatWidget from '../components/ChatWidget'
import VoiceCheckIn from '../components/VoiceCheckIn'
import InsightsPreview from '../components/InsightsPreview'
import CallStatus from '../components/CallStatus'
import { getUser, getUserCheckins } from '../lib/firestore'

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [mobileTab, setMobileTab] = useState('dashboard') // 'dashboard' | 'chat'
  const [user, setUser] = useState(null)
  const [checkins, setCheckins] = useState([])

  const userId = localStorage.getItem('userId')

  useEffect(() => {
    async function loadUser() {
      if (userId) {
        const userData = await getUser(userId)
        setUser(userData)
      }
    }
    loadUser()
  }, [userId])

  useEffect(() => {
    async function loadCheckins() {
      if (userId) {
        const data = await getUserCheckins(userId)
        setCheckins(data || [])
      }
    }
    loadCheckins()
  }, [userId])

  if (!user) {
    return <div className="db-root"><p>Loading...</p></div>
  }

  return (
    <div className="db-root">
      {/* Mobile tab bar */}
      <div className="mobile-tabs">
        <button
          className={`mobile-tab ${mobileTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setMobileTab('dashboard')}
        >🏠 Dashboard</button>
        <button
          className={`mobile-tab ${mobileTab === 'chat' ? 'active' : ''}`}
          onClick={() => setMobileTab('chat')}
        >💬 Chat</button>
      </div>

      <div className="db-layout">

        {/* ══════════════ LEFT COLUMN ══════════════ */}
        <div className={`db-left ${mobileTab === 'chat' ? 'mobile-hidden' : ''}`}>

          {/* Greeting */}
          <div className="db-card greeting-card">
            <h1 className="greeting-name">Hi {user.name} 👋</h1>
            <p className="greeting-date">{todayLabel()}</p>
          </div>

          {/* Voice Check-in */}
          <VoiceCheckIn userId={userId} />

          {/* Insights */}
          <InsightsPreview userId={userId} />

          {/* Bottom row: Recent Check-ins + Call Status */}
          <div className="bottom-row">
            {/* Call Status */}
            <CallStatus user={user} />
          </div>

        </div>
        {/* end left */}

        {/* ══════════════ RIGHT COLUMN — CHAT ══════════════ */}
        <div className={`db-right ${mobileTab === 'dashboard' ? 'mobile-hidden' : ''}`}>
          <ChatWidget userId={userId} userName={user.name} />
        </div>

      </div>
    </div>
  )
}
