// components/InsightsPreview.jsx
import './InsightsPreview.css'

export default function InsightsPreview({ moodFrequency, completionRate, checkins }) {
  const totalCheckins = checkins?.length || 0
  const recentMood = checkins?.[0]?.mood || 'unknown'

  const getMoodEmoji = (mood) => {
    const moodMap = {
      great: '😄',
      good: '🙂',
      okay: '😐',
      low: '😔',
      stressed: '😤'
    }
    return moodMap[mood] || '😊'
  }

  return (
    <div className="insights-preview card">
      <h2 className="insights-title">📊 Your Insights</h2>

      <div className="insights-grid">
        <div className="insight-item">
          <label>Current Mood</label>
          <div className="mood-display">
            <span className="mood-emoji">{getMoodEmoji(recentMood)}</span>
            <span className="mood-text">{recentMood.charAt(0).toUpperCase() + recentMood.slice(1)}</span>
          </div>
        </div>

        <div className="insight-item">
          <label>Check-ins This Week</label>
          <div className="stat-box">
            <span className="stat-number">{totalCheckins}</span>
            <span className="stat-label">completed</span>
          </div>
        </div>

        <div className="insight-item">
          <label>Completion Rate</label>
          <div className="completion-rate">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(completionRate || 0) * 100}%` }}
              ></div>
            </div>
            <span className="rate-text">{Math.round((completionRate || 0) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="mood-frequency">
        <h3>Mood Distribution</h3>
        <div className="frequency-bars">
          {Object.entries(moodFrequency || {}).map(([mood, count]) => (
            <div key={mood} className="frequency-bar-item">
              <label>{getMoodEmoji(mood)}</label>
              <div className="bar-container">
                <div className="bar" style={{ width: `${Math.min(count * 20, 100)}%` }}></div>
              </div>
              <span className="bar-count">{count || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="insights-reflection">
        <p>💡 You're doing great! Keep up with your daily check-ins to track your emotional patterns.</p>
      </div>
    </div>
  )
}
