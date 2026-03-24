'use client'

import { useEffect, useState, useCallback } from 'react'
import { decodeCalldata, decodeWithSelectedSignature, type DecodeOutput } from '@/lib/decoder'
import { getSessions, addSession, clearSessions, type SessionEntry } from '@/lib/storage'
import TypewriterTitle from './TypewriterTitle'
import TerminalInput from './TerminalInput'
import DecoderLog from './DecoderLog'
import ResultsPanel from './ResultsPanel'
import SessionSidebar from './SessionSidebar'
import Footer from './Footer'

interface Props {
  initialData?: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function CallsignApp({ initialData }: Props) {
  const [input, setInput] = useState(initialData ?? '')
  const [logLines, setLogLines] = useState<string[]>([])
  const [isDecoding, setIsDecoding] = useState(false)
  const [output, setOutput] = useState<DecodeOutput | null>(null)
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSessions(getSessions())
  }, [])

  const addLog = useCallback((line: string) => {
    setLogLines((prev) => [...prev, line])
  }, [])

  const runDecode = useCallback(
    async (hex: string) => {
      setIsDecoding(true)
      setLogLines([])
      setOutput(null)

      addLog('> initializing CALLSIGN decoder...')
      await sleep(180)
      addLog('> parsing raw calldata stream...')
      await sleep(130)

      const normalized = hex.trim().startsWith('0x') ? hex.trim() : '0x' + hex.trim()

      if (!/^0x[0-9a-fA-F]*$/.test(normalized)) {
        addLog('ERR >> Invalid hex format')
        setOutput({ status: 'error', selector: '', candidates: [], hexDump: [], error: 'Invalid hex format' })
        setIsDecoding(false)
        return
      }
      if (normalized.length < 10) {
        addLog('ERR >> Missing 4-byte selector')
        setOutput({
          status: 'error',
          selector: '',
          candidates: [],
          hexDump: [],
          error: 'Missing 4-byte selector (calldata too short)',
        })
        setIsDecoding(false)
        return
      }

      addLog('> resolving selector...')
      await sleep(100)
      addLog('> querying 4byte.directory...')

      const result = await decodeCalldata(normalized)

      if (result.status === 'error') {
        addLog(`ERR >> ${result.error}`)
      } else if (result.status === 'unknown') {
        addLog('> WARN: selector not found in any signature database')
        addLog('OK >> hex dump available.')
      } else if (result.status === 'candidates') {
        addLog(`> found ${result.candidates.length} candidate signatures`)
        addLog('> awaiting user selection...')
      } else {
        addLog('> decoding parameters...')
        await sleep(100)
        addLog('OK >> decoding complete.')

        addSession({
          calldata: normalized,
          selector: result.selector,
          signature: result.result?.signature,
          functionName: result.result?.functionName,
        })
        setSessions(getSessions())
      }

      setOutput(result)
      setIsDecoding(false)
    },
    [addLog]
  )

  const handleSelectSignature = useCallback(
    async (sig: string) => {
      if (!output) return
      setIsDecoding(true)
      addLog(`> decoding with: ${sig}`)

      const hex = input.trim().startsWith('0x') ? input.trim() : '0x' + input.trim()
      const result = await decodeWithSelectedSignature(hex, output.selector, sig)

      if (result.status === 'success') {
        addLog('OK >> decoding complete.')
        addSession({
          calldata: hex,
          selector: result.selector,
          signature: result.result?.signature,
          functionName: result.result?.functionName,
        })
        setSessions(getSessions())
      } else {
        addLog(`ERR >> ${result.error ?? 'Decode failed'}`)
      }

      setOutput(result)
      setIsDecoding(false)
    },
    [output, input, addLog]
  )

  const handleClear = useCallback(() => {
    setInput('')
    setOutput(null)
    setLogLines([])
  }, [])

  const handleSessionSelect = useCallback((s: SessionEntry) => {
    setInput(s.calldata)
    setOutput(null)
    setLogLines([])
    setSidebarOpen(false)
  }, [])

  const handleClearSessions = useCallback(() => {
    clearSessions()
    setSessions([])
  }, [])

  // Auto-decode on mount if URL param present
  useEffect(() => {
    if (initialData?.trim()) {
      runDecode(initialData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--tbg)' }}>
    <div className="flex flex-col flex-1 w-full max-w-5xl mx-auto">
      {/* Terminal header bar */}
      <header
        className="flex items-center gap-4 px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--tborder)', backgroundColor: '#000' }}
      >
        {/* macOS traffic lights */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#ff5f56' }} />
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#ffbd2e' }} />
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#27c93f' }} />
        </div>

        <TypewriterTitle />

        <button
          className="ml-auto text-xs px-2 py-1 border transition-colors hover:opacity-70 crt"
          style={{ borderColor: 'var(--tgreen)', color: 'var(--tgreen)' }}
          onClick={() => setSidebarOpen(true)}
        >
          [SESSION_LOG]
        </button>
      </header>

      {/* Body: main content + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Input */}
          <TerminalInput
            value={input}
            onChange={setInput}
            onDecode={() => runDecode(input)}
            isDecoding={isDecoding}
          />

          {/* Decoder log */}
          <DecoderLog lines={logLines} />

          {/* Empty state */}
          {!output && logLines.length === 0 && (
            <div
              className="border border-dashed flex items-center justify-center py-16 text-sm italic"
              style={{ borderColor: 'var(--tborder)', color: 'var(--tdim)', backgroundColor: '#000' }}
            >
              [ SYSTEM_IDLE: AWAITING_INPUT_STREAM ]
            </div>
          )}

          {/* Results */}
          {output && (
            <ResultsPanel
              output={output}
              calldata={input.trim().startsWith('0x') ? input.trim() : '0x' + input.trim()}
              onSelectSignature={handleSelectSignature}
              onClear={handleClear}
            />
          )}
        </main>

        {/* Session sidebar */}
        <SessionSidebar
          sessions={sessions}
          onSelect={handleSessionSelect}
          onClearAll={handleClearSessions}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <Footer />
    </div>
    </div>
  )
}
