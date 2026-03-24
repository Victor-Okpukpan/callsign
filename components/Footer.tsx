'use client'

import { useEffect, useState } from 'react'

export default function Footer() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => setTime(new Date().toISOString())
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <footer
      className="flex items-center justify-between px-4 py-8 border-t shrink-0 text-[10px]"
      style={{ borderColor: 'var(--tborder)', color: 'var(--tdim)' }}
    >
      <span className="hidden sm:block">
        STATUS: ONLINE&nbsp;&nbsp;//&nbsp;&nbsp;CONNECTION: SECURE
      </span>
      <span className="sm:hidden">STATUS: ONLINE</span>
      <span className="ml-auto text-right">
        CALLSIGN_OS v1.0.0&nbsp;&nbsp;//&nbsp;&nbsp;SYSTEM_TIME: {time}
      </span>
    </footer>
  )
}
