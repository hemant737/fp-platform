import { NextRequest, NextResponse } from 'next/server'
import { chatReply } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { messages, name } = await req.json()
    const reply = await chatReply(messages, name)
    return NextResponse.json({ reply })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
