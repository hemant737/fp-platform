import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { name, company, role, email } = await req.json()
    await supabaseAdmin.from('recruiters').upsert({ email, name, company, role, access_status: 'pending' }, { onConflict: 'email' })
    console.log(`NEW RECRUITER REQUEST — ${name} (${company}) — ${email}`)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
