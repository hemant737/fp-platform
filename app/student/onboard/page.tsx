'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { validateCollegeDomain } from '@/lib/colleges'
import { FPLogo } from '@/components/ui/Logo'

const SAMPLE = `Name: Aryan Mehta\nCollege: Jaipuria Institute of Management\nDegree: MBA\nGraduation: 2024\nGPA: 8.2/10\nInternships: Zomato (Operations), EY (Strategy)\nSkills: Excel, Strategy, Operations, Communication\nCertifications: Google Analytics\nProjects: 3`
const ROLES = ['Consulting','Business Analyst','Operations','Marketing','Finance','Sales','Strategy','HR','Product Management','Data Analytics']
const DOMAINS = ['FMCG','Fintech','Consulting','E-commerce','Healthcare','EdTech','Manufacturing','Media','Logistics','Real Estate']
const JOINING = ['Immediate','Within 3 months','Within 6 months','More than 6 months']

export default function Onboard() {
  const router = useRouter()
  const [msgs, setMsgs] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [inputOn, setInputOn] = useState(false)
  const [typing, setTyping] = useState(false)
  const [stage, setStage] = useState('greeting')
  const [data, setData] = useState<any>({})
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => { start() }, [])
  useEffect(() => { chatRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }) }, [msgs, typing])

  function addMsg(role: string, text: string, extra?: any) {
    setMsgs(p => [...p, { role, text, extra }])
  }

  async function say(text: string, delay = 700, extra?: any) {
    setTyping(true)
    await wait(delay)
    setTyping(false)
    addMsg('fp', text, extra)
  }

  async function start() {
    await say("Hey — welcome to First Principles. I'm going to help you build your career profile. Takes about 5 minutes.", 800)
    await say("What's your college email? We'll use it to verify you're from a partner institution.", 500)
    setInputOn(true)
    setStage('email')
  }

  async function send() {
    const val = input.trim()
    if (!val || !inputOn) return
    setInput('')
    setInputOn(false)
    addMsg('user', val)
    if (stage === 'email') {
      const { valid, college } = validateCollegeDomain(val)
      if (valid) {
        setData((p: any) => ({ ...p, email: val, college }))
        await say(`${college} — you're in. Drop your resume and we'll take it from here.`, 500, <UploadZone onUpload={handleResume} />)
        setStage('resume')
      } else {
        await say("That domain isn't on our list yet — use your official college email.", 500)
        setInputOn(true)
      }
    }
  }

  async function handleResume(text: string) {
    setTyping(true)
    const res = await fetch('/api/parse-resume', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }).then(r => r.json())
    setTyping(false)
    if (res.parsed) {
      setData((p: any) => ({ ...p, ...res.parsed }))
      addMsg('fp', "Got it — here's what I found in your resume.", <ParsedCard profile={res.parsed} />)
    }
    await say("Which roles are you targeting?", 600, <Chips items={ROLES} onConfirm={r => handleRoles(r)} />)
  }

  async function handleRoles(roles: string[]) {
    setData((p: any) => ({ ...p, roles }))
    addMsg('user', roles.join(', '))
    await say("And which industries?", 400, <Chips items={DOMAINS} onConfirm={d => handleDomains(d)} />)
  }

  async function handleDomains(domains: string[]) {
    setData((p: any) => ({ ...p, domains }))
    addMsg('user', domains.join(', '))
    await say("When are you available to join?", 400, <JoinPicker onSelect={j => handleJoining(j)} />)
  }

  async function handleJoining(joining: string) {
    addMsg('user', joining)
    await say("Building your profile now...", 300)
    const finalData = { ...data, joining }

    const saveRes = await fetch('/api/save-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: finalData.email, profile: finalData }) }).then(r => r.json())
    const reportRes = await fetch('/api/gap-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: saveRes.studentId, profile: finalData }) }).then(r => r.json())

    await say(`Your FP Score is ${reportRes.score?.total || '—'}. Here's your full gap report.`, 600)
    sessionStorage.setItem('fp_student', JSON.stringify({ ...finalData, studentId: saveRes.studentId, report: reportRes.report, score: reportRes.score }))
    setTimeout(() => router.push('/student/report'), 1500)
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: 600 }}>
        <div className="bg-navy px-5 py-3 flex items-center gap-3">
          <FPLogo variant="light" />
          <div className="ml-auto text-[10px] text-cream/30 tracking-widest">STUDENT ONBOARDING</div>
        </div>
        <div ref={chatRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-[#F5F0E8]">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-2 items-end ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <Av role={m.role} />
              <div className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed ${m.role === 'fp' ? 'bg-white border border-black/[0.08] rounded-[2px_14px_14px_14px] font-serif italic text-navy' : 'bg-navy text-cream rounded-[14px_2px_14px_14px]'}`}>
                {m.text}
                {m.extra && <div className="mt-2">{m.extra}</div>}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2 items-end">
              <Av role="fp" />
              <div className="bg-white border border-black/[0.08] px-4 py-3 rounded-[2px_14px_14px_14px] flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-steel animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
            </div>
          )}
        </div>
        <div className="px-4 py-3 bg-white border-t border-black/[0.08] flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} disabled={!inputOn}
            placeholder={inputOn ? 'Type your reply...' : ''}
            className="flex-1 bg-[#F5F0E8] rounded-full px-4 py-2 text-sm outline-none border border-black/[0.08] focus:border-steel disabled:opacity-0" />
          <button onClick={send} disabled={!inputOn} className="w-9 h-9 rounded-full bg-navy flex items-center justify-center disabled:bg-black/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff8e6" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function Av({ role }: { role: string }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${role === 'fp' ? 'bg-navy' : 'bg-steel'}`}>
      {role === 'fp'
        ? <svg width="14" height="12" viewBox="0 0 229.163 195.391"><path fill="#64ade0" d="M44.444,94.164l42.268,42.317,58.87-54.823-32.514,88.243h71.651V25.491L44.444,94.164Z"/></svg>
        : <span className="text-cream text-[10px] font-medium">U</span>}
    </div>
  )
}

function UploadZone({ onUpload }: { onUpload: (t: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  function handle(file: File) { file.text().then(t => onUpload(t || SAMPLE)).catch(() => onUpload(SAMPLE)) }
  return (
    <div className="mt-2">
      <div onClick={() => ref.current?.click()} className="border border-dashed border-steel rounded-lg p-4 text-center cursor-pointer hover:bg-[#F5F0E8] text-xs text-steel">
        Drop resume here or click to upload<br/><span className="opacity-60">PDF · DOCX · TXT</span>
        <input ref={ref} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={e => e.target.files?.[0] && handle(e.target.files[0])} />
      </div>
      <button onClick={() => onUpload(SAMPLE)} className="w-full mt-2 text-xs text-steel border border-black/[0.08] rounded-lg py-2 hover:bg-[#F5F0E8]">Use sample resume →</button>
    </div>
  )
}

function ParsedCard({ profile }: { profile: any }) {
  const fields = [['Name', profile.name], ['College', profile.college], ['Degree', profile.degree], ['GPA', profile.gpa], ['Internships', profile.internships?.map((i: any) => i.company || i).join(', ')], ['Skills', profile.skills?.slice(0,3).join(', ')]].filter(([,v]) => v)
  return (
    <div className="mt-2 bg-[#F5F0E8] rounded-lg p-3 text-[11px]">
      <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-2">Parsed from resume</div>
      {fields.map(([k,v]) => (
        <div key={k} className="flex justify-between py-1 border-b border-black/[0.06] last:border-0">
          <span className="text-steel">{k}</span><span className="font-medium text-navy text-right max-w-[55%]">{v}</span>
        </div>
      ))}
    </div>
  )
}

function Chips({ items, onConfirm }: { items: string[]; onConfirm: (s: string[]) => void }) {
  const [sel, setSel] = useState<string[]>([])
  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => (
          <button key={item} onClick={() => setSel(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])}
            className={`text-[11px] px-3 py-1 rounded-full border transition-all ${sel.includes(item) ? 'bg-navy text-cream border-navy' : 'border-steel text-steel'}`}>{item}</button>
        ))}
      </div>
      <button onClick={() => sel.length && onConfirm(sel)} disabled={!sel.length}
        className="w-full mt-2 py-2 bg-navy text-cream text-xs font-medium rounded-lg disabled:opacity-40">Confirm →</button>
    </div>
  )
}

function JoinPicker({ onSelect }: { onSelect: (j: string) => void }) {
  return (
    <div className="mt-2 flex flex-col gap-2">
      {JOINING.map(o => (
        <button key={o} onClick={() => onSelect(o)} className="text-left px-3 py-2.5 bg-[#F5F0E8] rounded-lg text-xs text-navy font-medium hover:bg-[#ede8dc] border border-black/[0.06]">{o}</button>
      ))}
    </div>
  )
}

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)) }
