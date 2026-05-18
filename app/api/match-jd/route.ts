import { NextRequest, NextResponse } from 'next/server'
import { matchJD } from '@/lib/claude'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const { jdText } = await req.json()
    if (!jdText) return NextResponse.json({ error: 'No JD text' }, { status: 400 })

    const parsed = await matchJD(jdText)

    const { data: students } = await supabaseAdmin
      .from('students')
      .select('id,name,initials,college_name,fp_score,fp_tier,target_roles,target_domains,skills,joining_timeline,score_dimensions,internships')
      .eq('status', 'verified')
      .order('fp_score', { ascending: false })

    const matches = (students || []).map(s => {
      let fit = 60
      if (s.target_roles?.some((r: string) => r.toLowerCase().includes((parsed?.role || '').toLowerCase().split(' ')[0]))) fit += 12
      if (s.target_domains?.some((d: string) => d.toLowerCase().includes((parsed?.domain || '').toLowerCase().split(' ')[0]))) fit += 10
      if (parsed?.joining_preference === 'immediate' && s.joining_timeline === 'immediate') fit += 8
      if ((s.fp_score || 0) >= 750) fit += 8
      else if ((s.fp_score || 0) >= 650) fit += 5
      const overlap = (parsed?.key_skills || []).filter((sk: string) => s.skills?.some((ss: string) => ss.toLowerCase().includes(sk.toLowerCase()))).length
      fit += overlap * 3
      return { ...s, fit: Math.min(99, fit) }
    }).sort((a, b) => b.fit - a.fit)

    return NextResponse.json({ parsed, matches })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
