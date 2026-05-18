import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { recruiterId, studentIds, notes } = await req.json()
    const { data } = await supabaseAdmin.from('recruiter_pools').insert({
      recruiter_id: recruiterId, student_ids: studentIds,
      notes, status: 'submitted', submitted_at: new Date().toISOString(),
    }).select('id').single()

    const { data: recruiter } = await supabaseAdmin.from('recruiters').select('name,company,email').eq('id', recruiterId).single()
    console.log(`NEW POOL — ${recruiter?.name} (${recruiter?.company}) — ${studentIds?.length} candidates — Pool: ${data?.id}`)

    return NextResponse.json({ poolId: data?.id })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
