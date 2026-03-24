export interface SessionEntry {
  id: string
  timestamp: number
  calldata: string
  selector: string
  signature?: string
  functionName?: string
}

const STORAGE_KEY = 'callsign_sessions'
const MAX_SESSIONS = 10

export function getSessions(): SessionEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SessionEntry[]) : []
  } catch {
    return []
  }
}

export function addSession(entry: Omit<SessionEntry, 'id' | 'timestamp'>): SessionEntry {
  const sessions = getSessions()
  const newEntry: SessionEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  const updated = [newEntry, ...sessions].slice(0, MAX_SESSIONS)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // storage quota exceeded
  }
  return newEntry
}

export function clearSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
