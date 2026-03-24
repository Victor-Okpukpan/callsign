'use client'

import { useEffect, useState } from 'react'

const TITLE = 'CALLSIGN_v1.0.0'

export default function TypewriterTitle() {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(TITLE.slice(0, i))
      if (i >= TITLE.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, 45)
    return () => clearInterval(interval)
  }, [])

  return (
    <h1 className="text-base sm:text-lg font-bold tracking-widest" style={{ color: 'var(--tgreen)' }}>
      {displayed}
      <span className={done ? 'cursor-blink' : ''} style={{ color: 'var(--tgreen)' }}>
        _
      </span>
    </h1>
  )
}
