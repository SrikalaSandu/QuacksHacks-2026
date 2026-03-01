// src/components/RecentCheckins.jsx
import { useState } from 'react'
import { updateCheckinStatus } from '../lib/firestore'
import './RecentCheckins.css'

const MODE_ICONS = {
  quick: '⚡',
  browser_voice: '🎙',
  phone: '📞',
  chat: '💬',
  future: '✨',
}

const MOOD_COLORS = {
  great: '#dcfce7',
  good: '#d1fae5',
  okay: '#fef9c3',
  low: '#dbeafe',
  stressed: '#fee2e2',
  calm: '#d1fae5',
  happy: '#dcfce7',
  anxious: '#fef9c3',
  sad: '#dbeafe',
  angry: '#fee2e2',
}

function moodColor(mood) {
  if (!mood) return '#f1f5f9'
  const k = mood.toLowerCase()
  for (const [key, val] of Object.entries(MOOD_COLORS)) {
    if (k.includes(key)) return val
  }
  return '#f1f5f9'
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diff = (now - d) / 1000

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800)
    return d.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RecentCheckins({ checkins, onStatusChange }) {
  const [toggling, setToggling] = useState(null)

  async function handleToggle(c) {
    setToggling(c.id)
    const newStatus = c.completionStatus === 'completed' ? 'pending' : 'completed'
    try {
      await updateCheckinStatus(c.id, newStatus)
      onStatusChange?.(c.id, newStatus)
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(null)
    }
  }

  if (!checkins || checkins.length === 0) {
    return (
      <div className="recent-empty">
        <span>📋</span>
        <p>No check-ins yet. Use the quick check-in above to start!</p>
      </div>
    )
  }

  return (
    <div className="recent-list">
      {checkins.slice(0, 5).map((c) => (
        <div key={c.id} className={`recent-item ${c.completionStatus === 'completed' ? 'completed' : ''}`}>
          <span className="recent-mode-icon">{MODE_ICONS[c.mode] || '💬'}</span>

          <div className="recent-body">
            <div className="recent-top">
              <span
                className="recent-mood-tag"
                style={{ background: moodColor(c.mood) }}
              >
                {c.mood || 'unknown'}
              </span>
              <span className="recent-time">{formatTime(c.timestamp)}</span>
            </div>
            {(c.note || c.transcript) && (
              <p className="recent-snippet">
                {(c.note || c.transcript || '').slice(0, 70)}
                {(c.note || c.transcript || '').length > 70 ? '…' : ''}
              </p>
            )}
          </div>

          <button
            className={`recent-toggle ${c.completionStatus === 'completed' ? 'done' : ''}`}
            onClick={() => handleToggle(c)}
            disabled={toggling === c.id}
            aria-label={c.completionStatus === 'completed' ? 'Mark pending' : 'Mark complete'}
            title={c.completionStatus === 'completed' ? 'Mark as pending' : 'Mark as completed'}
          >
            {toggling === c.id ? (
              <span className="spinner" style={{ width: 14, height: 14 }} />
            ) : (
              <span>{c.completionStatus === 'completed' ? '✓' : '○'}</span>
            )}
          </button>
        </div>
      ))}
    </div>
  )
}
