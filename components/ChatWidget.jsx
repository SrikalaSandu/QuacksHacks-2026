export default function ChatWidget({ userId, mode, futureSelf }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
      {futureSelf ? '✨ Future Self Chat Coming Soon' : '💬 Chat Widget Coming Soon'}
    </div>
  )
}
