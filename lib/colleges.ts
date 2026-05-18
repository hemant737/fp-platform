export const COLLEGE_DOMAINS: Record<string, string> = {
  'jaipuria.ac.in': 'Jaipuria Institute of Management',
  'jaipuria.edu.in': 'Jaipuria Institute of Management',
  // Add more colleges here as partnerships are signed
}

export function validateCollegeDomain(email: string): { valid: boolean; college?: string } {
  const domain = email.toLowerCase().split('@')[1]
  if (!domain) return { valid: false }
  const college = COLLEGE_DOMAINS[domain]
  return college ? { valid: true, college } : { valid: false }
}
