import { generateGapSummaryHaiku } from './claude'

export function detectGaps(profile: any, dims: any) {
  const gaps: any[] = []

  if (!profile.phase2_completed) gaps.push({
    title: 'Phase 2 assessment not completed',
    description: 'Your score is capped at 85% of potential. Phase 2 is a 15-min async video assessment.',
    action: 'Complete Phase 2 from the assessment tab.',
    priority: 'high', points_impact: 120,
  })

  const certs = profile.certifications?.length || 0
  if (certs === 0) gaps.push({
    title: 'No certifications added',
    description: 'Top performers average 4+ certifications. Each adds 15-20 points to your Domain score.',
    action: 'Add Google Analytics, HubSpot, or any XLRI/IIMB certification.',
    priority: 'high', points_impact: 60,
  })
  else if (certs < 3) gaps.push({
    title: `Only ${certs} certification${certs === 1 ? '' : 's'} added`,
    description: `Top scorers average 4+. You need ${3 - certs} more to reach the cohort average.`,
    action: 'Add Google, HubSpot, XLRI, or IIMB certifications.',
    priority: 'high', points_impact: 40,
  })

  const recs = profile.recommendations_count || 0
  if (recs === 0) gaps.push({
    title: 'No peer recommendations yet',
    description: 'Recommendations add significant weight to External Validation — currently at floor.',
    action: 'Request 2 recommendations via FP portal from internship managers.',
    priority: 'medium', points_impact: 45,
  })

  if (dims.eq_signal < 70) gaps.push({
    title: 'EQ signal below cohort average',
    description: `Your EQ score of ${dims.eq_signal} is below the cohort average of 74.`,
    action: 'Book a 1:1 mentor session — EQ is assessed through real conversations.',
    priority: 'medium', points_impact: 25,
  })

  if (!profile.internships?.length) gaps.push({
    title: 'No internship experience recorded',
    description: 'Applied work is the highest-weighted dimension at 25%.',
    action: 'Add any internship, freelance, or part-time work — even short ones count.',
    priority: 'high', points_impact: 80,
  })

  return gaps.sort((a, b) => {
    const o: any = { high: 0, medium: 1, low: 2 }
    return o[a.priority] - o[b.priority] || b.points_impact - a.points_impact
  })
}

export function detectStrengths(profile: any, dims: any) {
  const strengths: any[] = []
  const internships = profile.internships || []

  if (internships.length >= 2) strengths.push({
    title: 'Proven internship track record',
    description: `${internships.length} internships — a consistent pattern most peers at this stage lack.`,
    evidence: internships.slice(0,3).map((i: any) => i.company || i).join(', '),
  })

  if (dims.applied_work >= 75) strengths.push({
    title: 'Above-average applied work score',
    description: `Applied work score of ${dims.applied_work} — above cohort average and the most important dimension.`,
    evidence: `Score: ${dims.applied_work}/100`,
  })

  if ((profile.skills?.length || 0) >= 4) strengths.push({
    title: 'Broad, relevant skill set',
    description: `${profile.skills.length} skills — breadth signals adaptability to recruiters.`,
    evidence: profile.skills.slice(0,3).join(', '),
  })

  return strengths.slice(0, 3)
}

export async function buildGapReport(profile: any, scoreData: any) {
  const gaps = detectGaps(profile, scoreData.dimensions)
  const strengths = detectStrengths(profile, scoreData.dimensions)
  const next_steps = gaps.slice(0, 3).map((g: any) => g.action)
  const summary = await generateGapSummaryHaiku(profile, scoreData.total, scoreData.tier)

  return {
    summary, strengths, gaps, next_steps,
    fp_score: scoreData.total,
    tier: scoreData.tier,
    dimensions: scoreData.dimensions,
    completeness: scoreData.completeness,
    generated_at: new Date().toISOString(),
    engine: 'haiku',
  }
}

export function shouldRegenerate(oldProfile: any, newProfile: any, oldScore: number, newScore: number) {
  if (Math.abs(newScore - oldScore) > 10) return true
  if (oldProfile?.phase2_completed !== newProfile?.phase2_completed) return true
  if ((oldProfile?.internships?.length || 0) !== (newProfile?.internships?.length || 0)) return true
  if ((oldProfile?.certifications?.length || 0) !== (newProfile?.certifications?.length || 0)) return true
  return false
}
