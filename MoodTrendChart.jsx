// src/components/MoodTrendChart.jsx
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import './MoodTrendChart.css'

// Mood → numeric scale (higher = more positive)
const MOOD_SCALE = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  stressed: 1,
  calm: 4,
  happy: 5,
  anxious: 2,
  sad: 1,
  angry: 1,
}

const MOOD_LABELS = { 5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Low', 1: 'Difficult' }

function moodToNum(mood) {
  if (!mood) return 3
  const lower = mood.toLowerCase().trim()
  if (MOOD_SCALE[lower] !== undefined) return MOOD_SCALE[lower]
  // Try partial match
  for (const [key, val] of Object.entries(MOOD_SCALE)) {
    if (lower.includes(key)) return val
  }
  return 3
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="mood-tooltip">
      <p className="mood-tooltip-date">{d.date}</p>
      <p className="mood-tooltip-mood">{d.moodLabel}</p>
    </div>
  )
}

export default function MoodTrendChart({ checkins }) {
  if (!checkins || checkins.length === 0) {
    return (
      <div className="chart-empty">
        <span className="chart-empty-icon">📈</span>
        <p>No mood data yet</p>
      </div>
    )
  }

  // Take last 7, oldest first for left-to-right timeline
  const data = [...checkins]
    .slice(0, 7)
    .reverse()
    .map((c) => {
      const num = moodToNum(c.mood)
      return {
        date: formatDate(c.timestamp),
        value: num,
        moodLabel: c.mood ? c.mood.charAt(0).toUpperCase() + c.mood.slice(1) : MOOD_LABELS[num] || 'Okay',
      }
    })

  return (
    <div className="mood-trend-chart">
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e8" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9ab89a' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(v) => MOOD_LABELS[v]?.[0] || ''}
            tick={{ fontSize: 10, fill: '#9ab89a' }}
            axisLine={false}
            tickLine={false}
            width={16}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={3} stroke="#dff0d8" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#a8d99b"
            strokeWidth={2.5}
            dot={{ fill: '#a8d99b', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#3d5c3d', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
