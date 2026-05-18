import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const HAIKU = 'claude-haiku-4-5-20251001'
const SONNET = 'claude-sonnet-4-6'

export async function parseResume(text: string) {
  const r = await client.messages.create({
    model: HAIKU, max_tokens: 800,
    system: `Extract resume data. Return ONLY valid JSON: {name, college, degree, graduation_year, gpa, internships (array of {company, role} max 5), skills (array max 8), certifications (array max 5), projects (number), achievements (array max 3)}. Null for missing fields.`,
    messages: [{ role: 'user', content: text }],
  })
  try {
    return JSON.parse((r.content[0] as any).text.replace(/```json|```/g, '').trim())
  } catch { return null }
}

export async function chatReply(messages: any[], name?: string) {
  const r = await client.messages.create({
    model: HAIKU, max_tokens: 200,
    system: `You are First Principles onboarding assistant. Warm, sharp, like a helpful senior. 1-2 sentences max. Use student's name (${name || 'there'}) naturally. No bullet points. India English.`,
    messages,
  })
  return (r.content[0] as any).text
}

export async function generateGapReportSonnet(profile: any, scoreData: any) {
  const r = await client.messages.create({
    model: SONNET, max_tokens: 2000,
    system: `You are a career readiness analyst at First Principles, an Indian edtech platform. Generate a gap report. Return ONLY valid JSON: {summary (3 sentences, honest, specific), strengths [{title, description}] (3 items), gaps [{title, description, priority: "high"|"medium", action}] (4-5 items), next_steps [string] (3 items)}`,
    messages: [{ role: 'user', content: JSON.stringify({ ...profile, score: scoreData }) }],
  })
  try {
    return JSON.parse((r.content[0] as any).text.replace(/```json|```/g, '').trim())
  } catch { return null }
}

export async function generateGapSummaryHaiku(profile: any, score: number, tier: string) {
  const internships = (profile.internships || []).map((i: any) => i.company || i).join(', ') || 'none listed'
  const r = await client.messages.create({
    model: HAIKU, max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Write a 3-sentence career profile summary for an Indian MBA student. Score: ${score} (${tier}). Internships: ${internships}. Skills: ${(profile.skills || []).slice(0,3).join(', ')}. Targeting: ${(profile.roles || []).slice(0,2).join(' and ')}. Honest, specific, no fluff, written for a recruiter.`
    }],
  })
  return (r.content[0] as any).text.trim()
}

export async function matchJD(jdText: string) {
  const r = await client.messages.create({
    model: HAIKU, max_tokens: 400,
    system: `Extract JD requirements. Return ONLY valid JSON: {role, domain, key_skills (array 4), experience_level ("fresher"|"junior"|"mid"), communication_requirement ("high"|"medium"|"low"), joining_preference ("immediate"|"flexible")}`,
    messages: [{ role: 'user', content: jdText }],
  })
  try {
    return JSON.parse((r.content[0] as any).text.replace(/```json|```/g, '').trim())
  } catch { return null }
}
