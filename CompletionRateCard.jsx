// src/components/CompletionRateCard.jsx
import './CompletionRateCard.css'

function DonutChart({ pct }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="donut-svg">
      {/* Track */}
      <circle cx="48" cy="48" r={r} fill="none" stroke="#dff0d8" strokeWidth="9" />
      {/* Fill */}
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="#a8d99b"
        strokeWidth="9"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        style={{ transition: 'stroke-dashoffset 0.7s ease' }}
      />
      {/* Label */}
      <text x="48" y="48" textAnchor="middle" dominantBaseline="middle" className="donut-label">
        {pct}%
      </text>
    </svg>
  )
}

export default function CompletionRateCard({ checkins }) {
  if (!checkins || checkins.length === 0) {
    return (
      <div className="crc-empty">
        <span>✓</span>
        <p>Complete check-ins to see your rate</p>
      </div>
    )
  }

  const recent = checkins.slice(0, 7)
  const completed = recent.filter((c) => c.completionStatus === 'completed').length
  const pct = Math.round((completed / recent.length) * 100)

  return (
    <div className="crc-wrap">
      <DonutChart pct={pct} />
      <div className="crc-meta">
        <p className="crc-label">Completion Rate</p>
        <p className="crc-sub">{completed} of {recent.length} check-ins</p>
        <p className="crc-timeframe">Last 7 entries</p>
      </div>
    </div>
  )
}
