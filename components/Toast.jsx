export default function Toast({ msg, type = 'info' }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      background: type === 'error' ? '#ef4444' : '#10b981',
      color: 'white',
      fontSize: '14px',
      zIndex: 9999,
    }}>
      {msg}
    </div>
  )
}
