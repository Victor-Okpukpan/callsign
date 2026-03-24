import { ethers } from 'ethers'

export interface HexWord {
  offset: string
  word: string
}

export interface DecodedParam {
  index: number
  name: string
  type: string
  value: string
  raw: unknown
}

export interface SubTx {
  index: number
  operation: number
  operationLabel: string
  to: string
  value: string
  data: string
  decoded?: DecodedResult
}

export interface DecodedResult {
  selector: string
  signature: string
  functionName: string
  params: DecodedParam[]
  isMultiSend: boolean
  subTransactions?: SubTx[]
}

export interface DecodeOutput {
  status: 'success' | 'candidates' | 'unknown' | 'error'
  selector: string
  candidates: string[]
  apiSource?: string
  result?: DecodedResult
  hexDump: HexWord[]
  error?: string
}

const MULTISEND_SELECTOR = '8d80ff0a'

export function generateHexDump(hex: string): HexWord[] {
  const clean = hex.replace(/^0x/i, '').toLowerCase()
  const padded = clean.padEnd(Math.ceil(clean.length / 64) * 64, '0')
  const words: HexWord[] = []
  for (let i = 0; i < padded.length; i += 64) {
    words.push({
      offset: '0x' + (i / 2).toString(16).padStart(4, '0').toUpperCase(),
      word: padded.slice(i, i + 64).toUpperCase(),
    })
  }
  return words
}

async function resolveSelector(selector: string): Promise<{ candidates: string[]; source: string }> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`/api/4byte?selector=${selector}`, { signal: controller.signal })
    clearTimeout(timer)
    if (res.ok) {
      const data = await res.json()
      if (data.results?.length > 0) {
        return {
          candidates: data.results.map((r: { text_signature: string }) => r.text_signature),
          source: '4byte.directory',
        }
      }
    }
  } catch {
    // fall through
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`/api/openchain?selector=${selector}`, { signal: controller.signal })
    clearTimeout(timer)
    if (res.ok) {
      const data = await res.json()
      const hits = data.result?.function?.[`0x${selector}`]
      if (hits?.length > 0) {
        return {
          candidates: hits.map((h: { name: string }) => h.name),
          source: 'openchain.xyz',
        }
      }
    }
  } catch {
    // both failed
  }

  return { candidates: [], source: 'none' }
}

function formatValue(value: unknown, type: string): string {
  if (value === null || value === undefined) return 'null'

  if (typeof value === 'bigint') {
    return `${value.toString()} (0x${value.toString(16).toUpperCase()})`
  }

  if (typeof value === 'boolean') return value.toString()

  if (typeof value === 'string') {
    if (type === 'string') return `"${value}"`
    return value
  }

  if (value instanceof Uint8Array) {
    return '0x' + Array.from(value).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  }

  if (Array.isArray(value)) {
    const baseType = type.replace(/\[[\d]*\]$/, '')
    return `[${value.map(v => formatValue(v, baseType)).join(', ')}]`
  }

  if (value instanceof Object) {
    try {
      return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() + 'n' : v), 2)
    } catch {
      return String(value)
    }
  }

  return String(value)
}

function parseMultiSendTxs(transactionsHex: string): Omit<SubTx, 'decoded'>[] {
  const clean = transactionsHex.replace(/^0x/i, '').toLowerCase()
  const txs: Omit<SubTx, 'decoded'>[] = []
  let offset = 0
  let index = 0

  while (offset < clean.length) {
    // 1 byte op + 20 bytes to + 32 bytes value + 32 bytes dataLen = 85 bytes = 170 hex chars minimum
    if (clean.length - offset < 170) break

    const operation = parseInt(clean.slice(offset, offset + 2), 16)
    offset += 2

    const to = '0x' + clean.slice(offset, offset + 40)
    offset += 40

    const value = BigInt('0x' + (clean.slice(offset, offset + 64) || '0'))
    offset += 64

    const dataLength = Number(BigInt('0x' + (clean.slice(offset, offset + 64) || '0')))
    offset += 64

    const data = dataLength > 0 ? '0x' + clean.slice(offset, offset + dataLength * 2) : '0x'
    offset += dataLength * 2

    txs.push({
      index,
      operation,
      operationLabel: operation === 0 ? 'CALL' : 'DELEGATECALL',
      to,
      value: value.toString(),
      data,
    })
    index++
  }

  return txs
}

function decodeParams(rawHex: string, signature: string): DecodedParam[] | null {
  try {
    const iface = new ethers.Interface([`function ${signature}`])
    const fragment = iface.fragments[0]
    if (!fragment || !(fragment instanceof ethers.FunctionFragment)) return null

    const result = iface.decodeFunctionData(fragment.name, rawHex)

    return fragment.inputs.map((input, i) => ({
      index: i,
      name: input.name || `param${i}`,
      type: input.type,
      value: formatValue(result[i], input.type),
      raw: result[i],
    }))
  } catch {
    return null
  }
}

async function buildDecodedResult(
  rawHex: string,
  selector: string,
  signature: string,
  depth = 0
): Promise<DecodedResult | null> {
  const params = decodeParams(rawHex, signature)
  if (!params) return null

  const functionName = signature.split('(')[0]
  const isMultiSend = selector.toLowerCase() === MULTISEND_SELECTOR
  let subTransactions: SubTx[] | undefined

  if (isMultiSend && params.length > 0 && depth === 0) {
    const txsHex = typeof params[0].raw === 'string' ? params[0].raw : ''
    const rawTxs = parseMultiSendTxs(txsHex)

    subTransactions = await Promise.all(
      rawTxs.map(async (tx) => {
        if (!tx.data || tx.data === '0x' || tx.data.length < 10) return { ...tx }
        const subSelector = tx.data.slice(2, 10).toLowerCase()
        const { candidates } = await resolveSelector(subSelector)
        if (candidates.length === 1) {
          const subDecoded = await buildDecodedResult(tx.data, subSelector, candidates[0], 1)
          return { ...tx, decoded: subDecoded ?? undefined }
        }
        return { ...tx }
      })
    )
  }

  return { selector, signature, functionName, params, isMultiSend, subTransactions }
}

export async function decodeCalldata(rawHex: string): Promise<DecodeOutput> {
  let hex = rawHex.trim()
  if (!hex.startsWith('0x') && !hex.startsWith('0X')) hex = '0x' + hex

  if (!/^0x[0-9a-fA-F]*$/.test(hex)) {
    return { status: 'error', selector: '', candidates: [], hexDump: [], error: 'Invalid hex format' }
  }

  if (hex.length < 10) {
    return {
      status: 'error',
      selector: '',
      candidates: [],
      hexDump: generateHexDump(hex),
      error: 'Missing 4-byte selector (calldata too short)',
    }
  }

  const selector = hex.slice(2, 10).toLowerCase()
  const hexDump = generateHexDump(hex)

  const { candidates, source } = await resolveSelector(selector)

  if (candidates.length === 0) {
    return { status: 'unknown', selector, candidates: [], apiSource: source, hexDump }
  }

  if (candidates.length > 1) {
    return { status: 'candidates', selector, candidates, apiSource: source, hexDump }
  }

  const result = await buildDecodedResult(hex, selector, candidates[0])
  return {
    status: result ? 'success' : 'error',
    selector,
    candidates,
    apiSource: source,
    result: result ?? undefined,
    hexDump,
    error: result ? undefined : 'Failed to decode with resolved signature',
  }
}

export async function decodeWithSelectedSignature(
  rawHex: string,
  selector: string,
  signature: string
): Promise<DecodeOutput> {
  const hexDump = generateHexDump(rawHex)
  const result = await buildDecodedResult(rawHex, selector, signature)
  return {
    status: result ? 'success' : 'error',
    selector,
    candidates: [signature],
    result: result ?? undefined,
    hexDump,
    error: result ? undefined : 'Failed to decode with selected signature',
  }
}
