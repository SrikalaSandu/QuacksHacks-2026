// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'

// ── userId persistence (no Firebase Auth required) ──────────────────────────

export function getUserId() {
  let id = localStorage.getItem('ec_userId')
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 11)
    localStorage.setItem('ec_userId', id)
  }
  return id
}

// Always reads fresh from localStorage — never stale
export function isOnboarded() {
  return !!localStorage.getItem('ec_onboarded')
}

export function setOnboarded(name) {
  localStorage.setItem('ec_onboarded', '1')
  localStorage.setItem('ec_name', name)
}

export function getUserName() {
  return localStorage.getItem('ec_name') || 'Friend'
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
