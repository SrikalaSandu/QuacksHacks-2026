export default function RecentCheckins({ checkins = [] }) {
  if (!checkins || checkins.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        📝 No check-ins yet. Start your journey!
      </div>
    )
  }
  return (
    <div style={{ padding: '20px' }}>
      <h3>Recent Check-ins</h3>
      {checkins.map((c) => (
        <div key={c.id} style={{ padding: '10px', margin: '10px 0', border: '1px solid #eee', borderRadius: '8px' }}>
          <div>{c.mood} - {c.note}</div>
        </div>
      ))}
    </div>
  )
}
