'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { DecodeOutput, DecodedParam, SubTx, HexWord } from '@/lib/decoder'

interface Props {
  output: DecodeOutput
  calldata: string
  onSelectSignature: (sig: string) => void
  onClear: () => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      onClick={copy}
      className="text-xs px-2 py-0.5 border transition-colors hover:opacity-70"
      style={{ borderColor: 'var(--tdim)', color: 'var(--tdim)' }}
    >
      {copied ? '[COPIED]' : '[COPY]'}
    </button>
  )
}

function ParamCard({ param, index }: { param: DecodedParam; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scaleY: 0.95 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      transition={{ duration: 0.18, delay: index * 0.06 }}
      className="border p-3 text-sm group transition-colors"
      style={{ borderColor: 'var(--tborder)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,255,65,0.04)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-1.5 py-0.5 border" style={{ borderColor: 'var(--tdim)', color: 'var(--tdim)' }}>
              {param.type}
            </span>
            <span style={{ color: 'var(--tgreen)' }}>{param.name}</span>
          </div>
          <pre
            className="text-xs break-all whitespace-pre-wrap"
            style={{ color: 'var(--tgreen)', opacity: 0.85 }}
          >
            {param.value}
          </pre>
        </div>
        <CopyButton text={param.value} />
      </div>
    </motion.div>
  )
}

function SubTxCard({ tx, index }: { tx: SubTx; index: number }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.08 }}
      className="border text-sm"
      style={{ borderColor: 'var(--tborder)' }}
    >
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#0a1a0a] transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <span style={{ color: 'var(--tdim)' }}>TX_{tx.index}</span>
        <span
          className="text-xs px-1.5 py-0.5 border"
          style={{ borderColor: 'var(--tdim)', color: 'var(--tdim)' }}
        >
          {tx.operationLabel}
        </span>
        <span style={{ color: 'var(--tgreen)' }}>{tx.to}</span>
        {tx.value !== '0' && (
          <span className="ml-auto text-xs" style={{ color: 'var(--tamber)' }}>
            {tx.value} wei
          </span>
        )}
        <span className="ml-auto text-xs" style={{ color: 'var(--tdim)' }}>
          {expanded ? '[-]' : '[+]'}
        </span>
      </button>
      {expanded && (
        <div className="border-t px-3 pb-3 pt-2" style={{ borderColor: 'var(--tborder)' }}>
          {tx.decoded ? (
            <>
              <div className="text-xs mb-2" style={{ color: 'var(--tdim)' }}>
                {tx.decoded.signature}
              </div>
              {tx.decoded.params.map((p, i) => (
                <ParamCard key={i} param={p} index={i} />
              ))}
            </>
          ) : (
            <div className="text-xs" style={{ color: 'var(--tdim)' }}>
              <span>DATA: </span>
              <span className="break-all" style={{ color: 'var(--tgreen)', opacity: 0.6 }}>
                {tx.data}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

function HexDump({ words }: { words: HexWord[] }) {
  return (
    <div className="border text-xs font-mono overflow-x-auto" style={{ borderColor: 'var(--tborder)' }}>
      <div
        className="px-3 py-1.5 border-b text-xs"
        style={{ borderColor: 'var(--tborder)', color: 'var(--tdim)' }}
      >
        RAW_HEX_DUMP &nbsp;// {words.length} words ({words.length * 32} bytes)
      </div>
      <div className="p-3 space-y-0.5">
        {words.map((w, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, delay: i * 0.03 }}
            className="flex gap-4"
          >
            <span className="shrink-0" style={{ color: 'var(--tdim)' }}>
              {w.offset}
            </span>
            {i === 0 ? (
              <span>
                <span style={{ color: 'var(--tamber)' }}>{w.word.slice(0, 8)}</span>
                <span style={{ color: 'var(--tgreen)', opacity: 0.7 }}>{w.word.slice(8)}</span>
              </span>
            ) : (
              <span style={{ color: 'var(--tgreen)', opacity: 0.7 }}>{w.word}</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function ResultsPanel({ output, calldata, onSelectSignature, onClear }: Props) {
  const [showHexDump, setShowHexDump] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const handleShare = () => {
    const url = `${window.location.origin}?data=${encodeURIComponent(calldata)}`
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Action bar */}
      <div className="flex gap-3 flex-wrap items-center text-xs" style={{ color: 'var(--tdim)' }}>
        {output.apiSource && output.apiSource !== 'none' && (
          <span>SOURCE: {output.apiSource}</span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleShare}
            className="px-2 py-1 border hover:opacity-70 transition-colors"
            style={{ borderColor: 'var(--tdim)', color: 'var(--tdim)' }}
          >
            {shareCopied ? '[LINK_COPIED]' : '[SHARE_LINK]'}
          </button>
          <button
            onClick={() => setShowHexDump((p) => !p)}
            className="px-2 py-1 border hover:opacity-70 transition-colors"
            style={{ borderColor: 'var(--tdim)', color: 'var(--tdim)' }}
          >
            {showHexDump ? '[HIDE_HEXDUMP]' : '[SHOW_HEXDUMP]'}
          </button>
          <button
            onClick={onClear}
            className="px-2 py-1 border hover:opacity-70 transition-colors"
            style={{ borderColor: 'var(--terr)', color: 'var(--terr)' }}
          >
            [CLEAR_BUFFER]
          </button>
        </div>
      </div>

      {/* Unknown selector */}
      {output.status === 'unknown' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border p-4 text-sm"
          style={{ borderColor: 'var(--tamber)' }}
        >
          <div className="amber-pulse" style={{ color: 'var(--tamber)' }}>
            ⚠ UNKNOWN_SELECTOR: 0x{output.selector}
          </div>
          <div className="mt-2 text-xs" style={{ color: 'var(--tdim)' }}>
            Selector not found in 4byte.directory or openchain.xyz.{' '}
            <a
              href={`https://www.4byte.directory/signatures/?bytes4_signature=0x${output.selector}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70"
              style={{ color: 'var(--tamber)' }}
            >
              Submit it →
            </a>
          </div>
        </motion.div>
      )}

      {/* Multiple candidates picker */}
      {output.status === 'candidates' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border p-4"
          style={{ borderColor: 'var(--tamber)' }}
        >
          <div className="text-sm mb-3" style={{ color: 'var(--tamber)' }}>
            MULTIPLE_SIGNATURES_FOUND — select one to decode:
          </div>
          <div className="flex flex-col gap-2">
            {output.candidates.map((sig, i) => (
              <button
                key={i}
                onClick={() => onSelectSignature(sig)}
                className="text-left text-sm px-3 py-2 border transition-colors hover:bg-[#0a1a0a]"
                style={{ borderColor: 'var(--tborder)', color: 'var(--tgreen)' }}
              >
                {sig}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Decoded result */}
      {output.status === 'success' && output.result && (
        <div className="flex flex-col gap-3">
          {/* Function header */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="border p-3"
            style={{ borderColor: 'var(--tgreen)', backgroundColor: 'rgba(0,255,65,0.03)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--tdim)' }}>
              OK &gt;&gt; FUNCTION_RESOLVED
            </div>
            <div className="text-sm font-bold" style={{ color: 'var(--tgreen)' }}>
              {output.result.signature}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--tdim)' }}>
              SELECTOR: 0x{output.result.selector}
            </div>
          </motion.div>

          {/* Params */}
          {output.result.params.length === 0 ? (
            <div className="text-xs" style={{ color: 'var(--tdim)' }}>
              // no parameters
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {output.result.params.map((p, i) => (
                <ParamCard key={i} param={p} index={i} />
              ))}
            </div>
          )}

          {/* Safe multiSend sub-transactions */}
          {output.result.isMultiSend && output.result.subTransactions && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="text-xs" style={{ color: 'var(--tamber)' }}>
                SAFE_MULTISEND — {output.result.subTransactions.length} sub-transaction(s):
              </div>
              {output.result.subTransactions.map((tx, i) => (
                <SubTxCard key={i} tx={tx} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {output.status === 'error' && output.error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border p-3 text-sm"
          style={{ borderColor: 'var(--terr)', color: 'var(--terr)' }}
        >
          ERR &gt;&gt; {output.error}
        </motion.div>
      )}

      {/* Hex dump */}
      {showHexDump && output.hexDump.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <HexDump words={output.hexDump} />
        </motion.div>
      )}
    </div>
  )
}
