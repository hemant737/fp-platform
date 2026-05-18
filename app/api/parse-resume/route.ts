import { NextRequest, NextResponse } from 'next/server'
import { parseResume } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })
    const parsed = await parseResume(text)
    return NextResponse.json({ parsed })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
