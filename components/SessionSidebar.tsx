'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { SessionEntry } from '@/lib/storage'

interface Props {
  sessions: SessionEntry[]
  onSelect: (s: SessionEntry) => void
  onClearAll: () => void
  isOpen: boolean
  onClose: () => void
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false })
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s
}

export default function SessionSidebar({ sessions, onSelect, onClearAll, isOpen, onClose }: Props) {
  const content = (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#000' }}>
      <div
        className="flex items-center justify-between px-3 py-4 border-b text-xs"
        style={{ borderColor: 'var(--tborder)' }}
      >
        <span className="flex items-center text-[10px] gap-1.5" style={{ color: 'var(--tgreen)' }}>
          <span>⏱</span>
          <span>SESSION_LOG</span>
        </span>
        <div className="flex gap-2">
          {sessions.length > 0 && (
            <button
              onClick={onClearAll}
              className="hover:text-red-400 text-[10px] transition-colors"
              style={{ color: 'var(--tdim)' }}
            >
              [WIPE]
            </button>
          )}
          <button
            onClick={onClose}
            className="lg:hidden hover:opacity-70"
            style={{ color: 'var(--tdim)' }}
          >
            [✕]
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div
            className="p-4 text-xs text-center mt-8 italic"
            style={{ color: 'var(--tdim)' }}
          >
            LOG_EMPTY
          </div>
        ) : (
          sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="w-full text-left px-3 py-2 border-b text-xs transition-colors hover:bg-[#0f1f0f]"
              style={{ borderColor: 'var(--tborder)' }}
            >
              <div style={{ color: 'var(--tgreen)' }}>
                {s.functionName ?? `0x${s.selector}`}
              </div>
              <div style={{ color: 'var(--tdim)' }} className="mt-0.5">
                {truncate(s.calldata, 24)}
              </div>
              <div style={{ color: 'var(--tdim)' }} className="mt-0.5 opacity-60">
                {formatTime(s.timestamp)}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-50 w-64 flex flex-col border-l"
            style={{ borderColor: 'var(--tborder)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            {content}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
