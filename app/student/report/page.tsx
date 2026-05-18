'use client'
import { useEffect, useState } from 'react'
import { FPLogo, FPMark } from '@/components/ui/Logo'

const DIMS = ['Applied work','Communication','Domain fit','EQ signal','Certifications','Cognitive']
const PRO_CODE = '0504'

export default function Report() {
  const [data, setData] = useState<any>(null)
  const [isPro, setIsPro] = useState(false)
  const [proReport, setProReport] = useState<any>(null)
  const [showCode, setShowCode] = useState(false)
  const [code, setCode] = useState('')
  const [codeErr, setCodeErr] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  useEffect(() => {
    const s = sessionStorage.getItem('fp_student')
    if (s) setData(JSON.parse(s))
    if (sessionStorage.getItem('fp_pro') === 'true') {
      const pr = sessionStorage.getItem('fp_pro_report')
      if (pr) { setIsPro(true); setProReport(JSON.parse(pr)) }
    }
  }, [])

  async function unlock() {
    setCodeErr('')
    if (code !== PRO_CODE) { setCodeErr('Incorrect code.'); return }
    setUnlocking(true)
    const res = await fetch('/api/gap-report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: data?.studentId, profile: data, engine: 'sonnet' })
    }).then(r => r.json())
    setUnlocking(false)
    sessionStorage.setItem('fp_pro', 'true')
    sessionStorage.setItem('fp_pro_report', JSON.stringify(res.report))
    setProReport(res.report)
    setIsPro(true)
    setShowCode(false)
  }

  if (!data) return <div className="min-h-screen flex items-center justify-center text-steel text-sm font-serif italic">Loading your report...</div>

  const report = data.report || {}
  const score = data.score || {}
  const dims = score.dimensions || {}

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="bg-navy px-6 py-3 flex items-center gap-3">
        <FPLogo variant="light" />
        <span className={`ml-2 text-[10px] font-medium px-2.5 py-1 rounded-full ${isPro ? 'bg-[#E8D000] text-navy' : 'bg-white/10 text-cream/60'}`}>
          {isPro ? '★ PRO' : 'FREE'}
        </span>
        <div className="ml-auto text-[10px] text-cream/30 tracking-widest">MY PROFILE REPORT</div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Hero */}
        <div className="bg-navy rounded-2xl p-6 mb-4 flex items-center gap-5">
          <Av initials={data.name?.split(' ').map((n: string) => n[0]).join('').slice(0,2) || 'ST'} />
          <div className="flex-1">
            <div className="font-serif italic text-cream text-lg mb-0.5">{data.name || 'Your Profile'}</div>
            <div className="text-[11px] text-cream/40">{data.college} · {data.degree}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[40px] font-medium text-[#E8D000] leading-none">{score.total || '—'}</div>
            <div className="text-[10px] text-steel tracking-widest uppercase mt-1">{score.tier || '—'}</div>
          </div>
        </div>

        {!isPro ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#FAF7F2] border border-black/[0.08] rounded-2xl p-5">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-3">Top gaps to fix</div>
                {(report.gaps || []).slice(0,2).map((g: any, i: number) => (
                  <div key={i} className="flex gap-3 py-2.5 border-b border-black/[0.06] last:border-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${g.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div>
                      <div className="text-[12px] font-medium text-navy mb-0.5">{g.title}</div>
                      <div className="text-[10px] text-steel leading-relaxed">{g.description}</div>
                    </div>
                  </div>
                ))}
                {(report.gaps || []).length > 2 && (
                  <div className="mt-3 relative">
                    <div className="blur-sm pointer-events-none opacity-60">
                      <div className="py-2.5 border-b border-black/[0.06] text-xs text-steel">More gaps hidden...</div>
                      <div className="py-2.5 text-xs text-steel">More gaps hidden...</div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 rounded-lg px-3 py-1.5 text-[11px] font-medium text-navy border border-black/[0.08]">
                        🔒 {(report.gaps || []).length - 2} more in Pro
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#FAF7F2] border border-black/[0.08] rounded-2xl p-5">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-3">Score breakdown</div>
                <div className="flex flex-col gap-2">
                  {DIMS.map((name, i) => {
                    const val = Object.values(dims)[i] as number || 0
                    const locked = i >= 3
                    return (
                      <div key={name} className={`grid grid-cols-[1fr_auto] gap-2 items-center ${locked ? 'blur-sm' : ''}`}>
                        <div className="text-[11px] text-[#555]">{name}</div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-[3px] bg-[#e8e4da] rounded-full">
                            <div className="h-[3px] bg-steel rounded-full" style={{ width: `${val}%` }} />
                          </div>
                          <div className="font-mono text-[10px] text-navy w-5 text-right">{val}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Pro unlock */}
            <div className="bg-navy rounded-2xl p-5 mb-3">
              <div className="font-serif italic text-cream text-base mb-1">Unlock your full report.</div>
              <div className="text-[11px] text-cream/50 mb-3">All gaps · All strengths · Mentor note · Shareable HR link · Sonnet-powered</div>
              {!showCode ? (
                <button onClick={() => setShowCode(true)} className="px-4 py-2 bg-[#E8D000] text-navy text-xs font-medium rounded-lg">Enter access code →</button>
              ) : (
                <div className="flex gap-2 flex-wrap items-start">
                  <div>
                    <input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && unlock()}
                      placeholder="Code" maxLength={6}
                      className="px-3 py-2 rounded-lg text-sm bg-white/10 text-cream border border-white/20 outline-none focus:border-[#E8D000] w-28 tracking-widest text-center" />
                    {codeErr && <div className="text-[10px] text-[#E8D000] mt-1">{codeErr}</div>}
                  </div>
                  <button onClick={unlock} disabled={unlocking || !code} className="px-4 py-2 bg-[#E8D000] text-navy text-xs font-medium rounded-lg disabled:opacity-50">
                    {unlocking ? 'Generating...' : 'Unlock →'}
                  </button>
                  <button onClick={() => { setShowCode(false); setCode(''); setCodeErr('') }} className="text-xs text-cream/40 py-2">Cancel</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="bg-[#E8D000]/10 border border-[#E8D000]/30 rounded-xl px-4 py-2.5 mb-4 text-[11px] font-medium text-navy">
              ★ Pro report · Claude Sonnet · Full analysis unlocked
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#FAF7F2] border border-black/[0.08] rounded-2xl p-5">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-3">What's holding you back</div>
                {(proReport?.gaps || []).map((g: any, i: number) => (
                  <div key={i} className="flex gap-3 py-2.5 border-b border-black/[0.06] last:border-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${g.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="flex-1">
                      <div className="text-[12px] font-medium text-navy mb-0.5">{g.title}</div>
                      <div className="text-[10px] text-steel leading-relaxed">{g.description}</div>
                      <div className="text-[10px] text-green-700 mt-1 font-medium">→ {g.action}</div>
                    </div>
                    <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 h-fit ${g.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      {g.priority === 'high' ? 'High' : 'Med'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-[#FAF7F2] border border-black/[0.08] rounded-2xl p-5">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-3">What's working</div>
                {(proReport?.strengths || []).map((s: any, i: number) => (
                  <div key={i} className="flex gap-2 py-2.5 border-b border-black/[0.06] last:border-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D52" strokeWidth="2.5" className="flex-shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5"/></svg>
                    <div>
                      <div className="text-[12px] font-medium text-navy mb-0.5">{s.title}</div>
                      <div className="text-[10px] text-steel">{s.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#FAF7F2] border border-black/[0.08] rounded-2xl p-5">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-3">Score breakdown</div>
                <div className="flex flex-col gap-2">
                  {DIMS.map((name, i) => {
                    const val = Object.values(proReport?.dimensions || dims)[i] as number || 0
                    return (
                      <div key={name} className="grid grid-cols-[1fr_auto] gap-2 items-center">
                        <div className="text-[11px] text-[#555]">{name}</div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-[3px] bg-[#e8e4da] rounded-full">
                            <div className="h-[3px] bg-steel rounded-full" style={{ width: `${val}%` }} />
                          </div>
                          <div className="font-mono text-[10px] text-navy w-5 text-right">{val}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-black/[0.08] rounded-2xl p-5">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-3">Next 3 moves</div>
                <div className="flex flex-col gap-2">
                  {(proReport?.next_steps || []).map((step: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start p-2.5 bg-[#F5F0E8] rounded-lg text-xs text-navy">
                      <div className="w-5 h-5 rounded-full bg-navy text-cream text-[10px] font-medium flex items-center justify-center flex-shrink-0">{i+1}</div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {proReport?.summary && (
              <div className="bg-[#FAF7F2] border border-black/[0.08] rounded-2xl p-5 mb-3">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-3">Profile summary</div>
                <div className="font-serif text-sm font-light text-navy leading-relaxed italic">{proReport.summary}</div>
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-black/[0.08]">
          <div className="flex items-center gap-2">
            <FPMark size={13} fill="#6486ac" />
            <div className="text-[10px] text-steel">v{data.report?.report_version || 1} · {new Date().toLocaleDateString('en-IN')} · First Principles</div>
          </div>
          <button onClick={() => window.location.href = '/student/onboard'} className="text-[10px] font-medium px-3 py-1.5 rounded-lg bg-navy text-cream">
            Update profile →
          </button>
        </div>
      </div>
    </div>
  )
}

function Av({ initials }: { initials: string }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="28" fill="#2C4A7C"/>
      <circle cx="28" cy="19" r="8" fill="#7EB3E8" opacity="0.3"/>
      <text x="28" y="43" textAnchor="middle" fontFamily="DM Sans" fontSize="13" fontWeight="500" fill="#fff8e6" letterSpacing="1">{initials}</text>
    </svg>
  )
}
