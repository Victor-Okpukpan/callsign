'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  lines: string[]
}

export default function DecoderLog({ lines }: Props) {
  if (lines.length === 0) return null

  return (
    <div
      className="border p-3 text-[10px]"
      style={{ borderColor: 'var(--tborder)', backgroundColor: '#000' }}
    >
      <div className="text-xs mb-2" style={{ color: 'var(--tdim)' }}>
        DECODER_LOG
      </div>
      <AnimatePresence initial={false}>
        {lines.map((line, i) => {
          const isOk = line.startsWith('OK >>')
          const isErr = line.startsWith('ERR >>')
          const color = isOk ? 'var(--tgreen)' : isErr ? 'var(--terr)' : 'var(--tdim)'
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.12 }}
              style={{ color }}
            >
              {line}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
