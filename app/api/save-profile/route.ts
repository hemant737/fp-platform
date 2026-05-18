import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { computeFPScore } from '@/lib/scoring'
import { validateCollegeDomain } from '@/lib/colleges'

export async function POST(req: NextRequest) {
  try {
    const { email, profile } = await req.json()
    if (!email || !profile) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

    const { valid, college } = validateCollegeDomain(email)
    if (!valid) return NextResponse.json({ error: 'Domain not whitelisted' }, { status: 403 })

    const scoreData = computeFPScore(profile)
    const initials = profile.name?.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase() || 'ST'

    const { data, error } = await supabaseAdmin.from('students').upsert({
      email, college_name: college, college_domain: email.split('@')[1],
      name: profile.name, initials, degree: profile.degree,
      graduation_year: profile.graduation_year, gpa: profile.gpa,
      skills: profile.skills, internships: profile.internships,
      certifications: profile.certifications, projects: profile.projects || 0,
      target_roles: profile.roles, target_domains: profile.domains,
      joining_timeline: profile.joining,
      fp_score: scoreData.total, fp_tier: scoreData.tier,
      score_dimensions: scoreData.dimensions, profile_completeness: scoreData.completeness,
      onboarding_complete: true, updated_at: new Date().toISOString(),
    }, { onConflict: 'email' }).select('id').single()

    if (error) throw error
    return NextResponse.json({ studentId: data.id, score: scoreData })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
