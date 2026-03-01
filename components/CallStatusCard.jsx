// components/CallStatusCard.jsx
import { useState } from 'react'
import './CallStatusCard.css'

export default function CallStatusCard({ phoneNumber, checkInTime, timezone }) {
  const [status, setStatus] = useState('idle') // 'idle', 'scheduled', 'in_call'

  const handleScheduleCall = () => {
    setStatus('scheduled')
    // TODO: Setup backend integration with Twilio
    // POST /schedule-call with phoneNumber and checkInTime
  }

  const getStatusColor = () => {
    switch (status) {
      case 'in_call':
        return '#ef4444'
      case 'scheduled':
        return '#f59e0b'
      case 'idle':
      default:
        return '#6b8a4a'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'in_call':
        return 'In Call'
      case 'scheduled':
        return 'Scheduled'
      case 'idle':
      default:
        return 'Idle'
    }
  }

  return (
    <div className="call-status-card card">
      <div className="call-header">
        <h2 className="call-title">📞 Daily Check-in Call</h2>
        <div className="status-pill" style={{ backgroundColor: getStatusColor() }}>
          {getStatusLabel()}
        </div>
      </div>

      <div className="call-details">
        <div className="detail-item">
          <label>Scheduled Time</label>
          <p>{checkInTime || '09:00 AM'}</p>
        </div>
        <div className="detail-item">
          <label>Time Zone</label>
          <p>{timezone || 'EST'}</p>
        </div>
        <div className="detail-item">
          <label>Phone Number</label>
          <p>{phoneNumber || 'Not set'}</p>
        </div>
      </div>

      <div className="call-info">
        <p>
          Receive an AI-powered phone call at your scheduled time to check in on your emotional wellness.
        </p>
      </div>

      {status === 'idle' && (
        <button className="btn btn-primary btn-full" onClick={handleScheduleCall}>
          Schedule Call
        </button>
      )}

      {status === 'scheduled' && (
        <button className="btn btn-secondary btn-full" disabled>
          ✓ Scheduled for {checkInTime}
        </button>
      )}

      <div className="call-note">
        <p>💡 <strong>Note:</strong> Twilio integration coming soon. This is a frontend preview.</p>
      </div>
    </div>
  )
}
