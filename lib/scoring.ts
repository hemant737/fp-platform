export function computeFPScore(profile: any) {
  const internships = profile.internships?.length || 0
  const projects = profile.projects || 0
  const skills = profile.skills?.length || 0
  const certs = profile.certifications?.length || 0
  const recs = profile.recommendations_count || 0
  const phase2 = profile.phase2_completed || false

  const applied_work   = Math.min(100, internships * 25 + projects * 5 + 15)
  const cognitive      = Math.min(100, parseGPA(profile.gpa) + (phase2 ? 10 : 0))
  const communication  = phase2 ? Math.min(100, profile.phase2_score || 72) : Math.min(72, skills * 6 + 30)
  const eq_signal      = phase2 ? 74 : 60
  const domain_certs   = Math.min(100, certs * 18 + (profile.domains?.length || 0) * 8 + 10)
  const external_valid = Math.min(100, recs * 35 + 10)

  const dimensions = { applied_work, cognitive, communication, eq_signal, domain_certs, external_valid }

  const total = Math.round(
    applied_work * 0.25 + cognitive * 0.20 + communication * 0.18 +
    eq_signal * 0.15 + domain_certs * 0.12 + external_valid * 0.10
  ) * 10

  const completeness = Math.round([
    internships > 0, projects > 0, skills > 0,
    certs > 0, profile.gpa, phase2, recs > 0,
    profile.roles?.length > 0, profile.domains?.length > 0
  ].filter(Boolean).length / 9 * 100)

  const tier = total >= 850 ? 'Distinguished' : total >= 700 ? 'Excellent' : total >= 550 ? 'Proficient' : 'Developing'

  return { total, tier, dimensions, completeness }
}

function parseGPA(gpa: string): number {
  if (!gpa) return 55
  const n = parseFloat(gpa)
  if (isNaN(n)) return 55
  return n > 10 ? Math.min(95, n * 0.9) : Math.min(95, n * 9.5)
}
