export default function VoiceCheckIn({ userId, onClose }) {
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', zIndex: 1000, textAlign: 'center' }}>
      <h2>🎙️ Voice Check-in</h2>
      <p style={{ color: '#666' }}>Coming soon - speak your thoughts</p>
      <button onClick={onClose} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        Close
      </button>
    </div>
  )
}
