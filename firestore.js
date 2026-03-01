// src/lib/firestore.js
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// Safety check for db
function checkDb() {
  if (!db) throw new Error('Firebase not initialized')
}

// ── Users ──────────────────────────────────────────────

export async function createUser(userId, data) {
  checkDb()
  await setDoc(doc(db, 'users', userId), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function getUser(userId) {
  checkDb()
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUser(userId, data) {
  checkDb()
  await updateDoc(doc(db, 'users', userId), data)
}

// ── Check-ins ──────────────────────────────────────────

export async function addCheckin(data) {
  checkDb()
  const ref = await addDoc(collection(db, 'checkins'), {
    ...data,
    timestamp: serverTimestamp(),
    completionStatus: data.completionStatus ?? 'pending',
  })
  return ref.id
}

export async function updateCheckinStatus(checkinId, status) {
  checkDb()
  await updateDoc(doc(db, 'checkins', checkinId), {
    completionStatus: status,
  })
}

export async function getUserCheckins(userId, limitCount = 20) {
  checkDb()
  const q = query(
    collection(db, 'checkins'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ── Memory Summary ─────────────────────────────────────

export async function getMemorySummary(userId) {
  checkDb()
  const snap = await getDoc(doc(db, 'memory_summary', userId))
  return snap.exists() ? snap.data() : null
}

// ── Chat History ───────────────────────────────────────

export async function addChatMessage(userId, message, role) {
  checkDb()
  await addDoc(collection(db, 'chat_history'), {
    userId,
    message,
    role,
    timestamp: serverTimestamp(),
  })
}

export async function getChatHistory(userId, limitCount = 20) {
  checkDb()
  const q = query(
    collection(db, 'chat_history'),
    where('userId', '==', userId),
    orderBy('timestamp', 'asc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
