import { NextRequest, NextResponse } from 'next/server'
import { buildGapReport, shouldRegenerate } from '@/lib/gap-engine'
import { generateGapReportSonnet } from '@/lib/claude'
import { computeFPScore } from '@/lib/scoring'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { studentId, profile, engine } = await req.json()
    if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 400 })

    const scoreData = computeFPScore(profile)

    // SONNET — only when student enters pro code
    if (engine === 'sonnet') {
      const ai = await generateGapReportSonnet(profile, scoreData)
      const report = {
        ...ai,
        fp_score: scoreData.total,
        tier: scoreData.tier,
        dimensions: scoreData.dimensions,
        completeness: scoreData.completeness,
        generated_at: new Date().toISOString(),
        engine: 'sonnet',
      }
      if (studentId) {
        await supabaseAdmin.from('students').update({
          gap_report: report, fp_score: scoreData.total, fp_tier: scoreData.tier,
          score_dimensions: scoreData.dimensions, profile_completeness: scoreData.completeness,
        }).eq('id', studentId)
      }
      return NextResponse.json({ report, score: scoreData, engine: 'sonnet' })
    }

    // HAIKU (default) — check cache first
    if (studentId) {
      const { data: s } = await supabaseAdmin
        .from('students').select('gap_report, fp_score').eq('id', studentId).single()
      if (s?.gap_report && !shouldRegenerate(s.gap_report, profile, s.fp_score || 0, scoreData.total)) {
        return NextResponse.json({ report: s.gap_report, score: scoreData, cached: true })
      }
    }

    const report = await buildGapReport(profile, scoreData)

    if (studentId) {
      const { data: s } = await supabaseAdmin.from('students').select('report_version').eq('id', studentId).single()
      const v = (s?.report_version || 0) + 1
      await supabaseAdmin.from('student_versions').insert({ student_id: studentId, version: v, profile_snapshot: profile, gap_report: report, fp_score: scoreData.total })
      await supabaseAdmin.from('students').update({
        gap_report: report, fp_score: scoreData.total, fp_tier: scoreData.tier,
        score_dimensions: scoreData.dimensions, profile_completeness: scoreData.completeness,
        report_version: v, report_updated_at: new Date().toISOString(),
      }).eq('id', studentId)
    }

    return NextResponse.json({ report, score: scoreData, engine: 'haiku' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
