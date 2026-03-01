// src/components/InsightsPanel.jsx
import MoodTrendChart from './MoodTrendChart'
import CompletionRateCard from './CompletionRateCard'
import StreakCard from './StreakCard'
import './InsightsPanel.css'

export default function InsightsPanel({ checkins, loading }) {
  if (loading) {
    return (
      <div className="insights-panel-loading">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    )
  }

  if (!checkins || checkins.length === 0) {
    return (
      <div className="insights-panel-empty">
        <div className="insights-empty-art">🌱</div>
        <h3 className="insights-empty-title">No check-ins yet</h3>
        <p className="insights-empty-sub">
          Start your journey today. Your mood trends, streaks, and insights will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="insights-panel">
      {/* Mood Trend - full width */}
      <div className="insight-card insight-card-wide">
        <h3 className="insight-card-title">📈 Mood Trend</h3>
        <p className="insight-card-sub">Your emotional journey this week</p>
        <MoodTrendChart checkins={checkins} />
      </div>

      {/* Completion + Streak - side by side */}
      <div className="insight-cards-row">
        <div className="insight-card">
          <h3 className="insight-card-title">✓ Completion</h3>
          <CompletionRateCard checkins={checkins} />
        </div>
        <div className="insight-card">
          <h3 className="insight-card-title">🔥 Streak</h3>
          <StreakCard checkins={checkins} />
        </div>
      </div>
    </div>
  )
}
