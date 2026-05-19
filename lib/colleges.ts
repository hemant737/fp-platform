export const FP_TEAM_EMAILS = [
  'hemant@firstprinciple.org.in',
  'samarth@firstprinciple.org.in',
  'hemant@firstprinciples.org.in',
  'samarth@firstprinciples.org.in',
]

export const COLLEGE_DOMAINS: Record<string, string> = {
  'jaipuria.ac.in': 'Jaipuria Institute of Management',
  'jaipuria.edu.in': 'Jaipuria Institute of Management',
  'mastersunion.org': 'Masters Union',
}

export function validateCollegeDomain(email: string): { valid: boolean; college?: string; isFPTeam?: boolean } {
  const lower = email.toLowerCase().trim()
  if (FP_TEAM_EMAILS.includes(lower)) {
    return { valid: true, college: 'First Principles', isFPTeam: true }
  }
  const domain = lower.split('@')[1]
  if (!domain) return { valid: false }
  const college = COLLEGE_DOMAINS[domain]
  return college ? { valid: true, college } : { valid: false }
}
