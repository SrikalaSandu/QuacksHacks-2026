// components/GreetingCard.jsx
import { useEffect, useState } from 'react'
import './GreetingCard.css'

export default function GreetingCard({ userName }) {
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const today = new Date()
    const formatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
    setCurrentDate(formatted)
  }, [])

  return (
    <div className="greeting-card">
      <div className="greeting-content">
        <h1 className="greeting-title">Hi {userName} 👋</h1>
        <p className="greeting-date">{currentDate}</p>
        <p className="greeting-subtitle">Welcome back. How are you feeling today?</p>
      </div>
    </div>
  )
}
