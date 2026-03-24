import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const selector = request.nextUrl.searchParams.get('selector')
  if (!selector) {
    return NextResponse.json({ error: 'Missing selector' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(
      `https://api.openchain.xyz/signature-database/v1/lookup?function=0x${selector}`,
      { signal: controller.signal, next: { revalidate: 3600 } }
    )
    clearTimeout(timer)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed'
    return NextResponse.json({ error: message, result: { function: {} } }, { status: 502 })
  }
}
