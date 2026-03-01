// src/components/StreakCard.jsx
import './StreakCard.css'

function getDateStr(timestamp) {
  if (!timestamp) return null
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

function computeStreak(checkins) {
  if (!checkins || checkins.length === 0) return 0

  // Get unique dates with check-ins, sorted desc
  const dates = [...new Set(checkins.map((c) => getDateStr(c.timestamp)).filter(Boolean))].sort(
    (a, b) => new Date(b) - new Date(a)
  )

  if (dates.length === 0) return 0

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  // Streak must start today or yesterday
  if (dates[0] !== today && dates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (prev - curr) / 86400000
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export default function StreakCard({ checkins }) {
  const streak = computeStreak(checkins)

  return (
    <div className="streak-card">
      <div className="streak-flame">{streak > 0 ? '🔥' : '💤'}</div>
      <div className="streak-info">
        <p className="streak-number">{streak}</p>
        <p className="streak-label">{streak === 1 ? 'Day streak' : 'Day streak'}</p>
        {streak === 0 && (
          <p className="streak-hint">Check in today to start!</p>
        )}
        {streak > 0 && (
          <p className="streak-hint">Keep it up! 💪</p>
        )}
      </div>
    </div>
  )
}
