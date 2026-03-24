'use client'

interface Props {
  value: string
  onChange: (v: string) => void
  onDecode: () => void
  isDecoding: boolean
}

export default function TerminalInput({ value, onChange, onDecode, isDecoding }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      onDecode()
    }
  }

  return (
    <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--tdim)' }}>
          <span className="text-xs ml-auto">CTRL+ENTER to run</span>
        </div>
      <div
        className="crt input-box border p-3 transition-all duration-150"
        style={{ borderColor: 'var(--tborder)', backgroundColor: '#000' }}
      >
        <div className="flex gap-2">
          <span className="text-sm shrink-0" style={{ color: 'var(--tgreen)' }}>
            &gt;
          </span>
          <textarea
            className="flex-1 bg-transparent text-sm resize-none outline-0"
            style={{ color: 'var(--tgreen)', caretColor: 'var(--tgreen)', border: 'none' }}
            rows={7}
            spellCheck={false}
            placeholder="PASTE_HEX_DATA_HERE..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDecoding}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onDecode}
          disabled={isDecoding || !value.trim()}
          className="text-sm px-4 py-2 border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            borderColor: 'var(--tgreen)',
            color: 'var(--tbg)',
            backgroundColor: isDecoding ? 'var(--tdim)' : 'var(--tgreen)',
          }}
        >
          {isDecoding ? '[ DECODING... ]' : '[ RUN_DECODER ]'}
        </button>
      </div>
    </div>
  )
}
