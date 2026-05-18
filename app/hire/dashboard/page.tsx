'use client'
import { useState } from 'react'
import { FPLogo, FPMark } from '@/components/ui/Logo'

const BG = ['#2C4A7C','#4A2C6B','#2C5A3F','#6B3A2C','#2C4A5A','#5A2C4A','#3A5A2C','#5A4A2C']

export default function HireDashboard() {
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<any[]>([])
  const [parsed, setParsed] = useState<any>(null)
  const [pool, setPool] = useState<any[]>([])
  const [view, setView] = useState<'grid'|'list'>('grid')
  const [selected, setSelected] = useState<any>(null)
  const [submitted, setSubmitted] = useState(false)
  const [minScore, setMinScore] = useState(400)

  async function match() {
    if (!jd.trim()) return
    setLoading(true)
    const res = await fetch('/api/match-jd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jdText: jd }) }).then(r => r.json())
    setParsed(res.parsed)
    setMatches(res.matches || [])
    setLoading(false)
  }

  async function submitPool() {
    await fetch('/api/submit-pool', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentIds: pool.map(p => p.id) }) })
    setSubmitted(true)
  }

  const filtered = matches.filter(m => (m.fp_score || 0) >= minScore)

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <div className="bg-navy px-6 py-3 flex items-center gap-4">
        <FPLogo variant="light" />
        <div className="text-[10px] text-cream/30 tracking-widest">TALENT INTELLIGENCE</div>
        <div className="ml-auto flex gap-1 bg-cream/10 rounded-lg p-1">
          {(['grid','list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1 rounded text-[11px] font-medium ${view===v ? 'bg-cream/20 text-cream' : 'text-cream/40'}`}>
              {v === 'grid' ? '⊞' : '☰'} {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1" style={{ height: 'calc(100vh - 52px)' }}>
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 bg-[#FAF7F2] border-r border-black/[0.08] p-4 overflow-y-auto">
          <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-2">Job Description</div>
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste JD here..." className="w-full h-28 px-3 py-2 text-xs bg-[#F5F0E8] border border-black/[0.08] rounded-lg outline-none resize-none text-navy leading-relaxed focus:border-steel" />
          <button onClick={match} disabled={loading || !jd.trim()} className="w-full mt-2 py-2 bg-navy text-cream text-xs font-medium rounded-lg disabled:opacity-40">
            {loading ? 'Matching...' : 'Match profiles →'}
          </button>
          {parsed && (
            <div className="mt-3 bg-[#F5F0E8] rounded-lg p-2.5 text-[10px]">
              <div className="font-medium text-navy mb-1">{parsed.role}</div>
              <div className="flex flex-wrap gap-1">
                {[parsed.domain, ...(parsed.key_skills||[])].filter(Boolean).map((t:string) => (
                  <span key={t} className="bg-white border border-black/[0.08] px-2 py-0.5 rounded-full text-steel">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4">
            <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-2">Filters</div>
            <div className="text-[10px] text-steel/70 mb-1">Min FP Score — {minScore}</div>
            <input type="range" min="400" max="900" step="50" value={minScore} onChange={e => setMinScore(parseInt(e.target.value))} className="w-full" />
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-3 bg-[#FAF7F2] border-b border-black/[0.08]">
            <div className="font-serif italic text-navy text-sm">
              {matches.length ? `${filtered.length} profiles matched` : 'Paste a JD on the left to see matched profiles.'}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!matches.length ? (
              <div className="flex items-center justify-center h-full text-steel text-sm font-serif italic">Upload a JD to get started.</div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-3 gap-3">
                {filtered.map((s, i) => (
                  <div key={s.id||i} onClick={() => setSelected(s)} className={`bg-[#FAF7F2] border rounded-2xl p-4 cursor-pointer hover:border-steel transition-all ${pool.some(p=>p.id===s.id) ? 'border-navy bg-[#f0ede6]' : 'border-black/[0.08]'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <Av initials={s.initials||'ST'} idx={i} size={40} />
                      <div>
                        <div className="text-[13px] font-medium text-navy">{s.initials}</div>
                        <div className="text-[10px] text-steel">{s.college_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-mono text-[17px] font-medium text-[#E8D000] bg-navy rounded-md px-2 py-0.5 leading-none">{s.fp_score}</div>
                      <div className="text-[10px] text-steel">Fit <strong className="text-navy">{s.fit}%</strong></div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(s.skills||[]).slice(0,3).map((sk: string) => <span key={sk} className="text-[9px] px-2 py-0.5 rounded-full bg-[#e8e4da] text-steel">{sk}</span>)}
                    </div>
                    <button onClick={e => { e.stopPropagation(); pool.some(p=>p.id===s.id) ? setPool(prev=>prev.filter(p=>p.id!==s.id)) : setPool(prev=>[...prev,s]) }}
                      className={`w-full text-[11px] font-medium py-1.5 rounded-lg border transition-all ${pool.some(p=>p.id===s.id) ? 'bg-navy text-cream border-navy' : 'border-navy text-navy'}`}>
                      {pool.some(p=>p.id===s.id) ? '✓ In pool' : '+ Add to pool'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#FAF7F2] border border-black/[0.08] rounded-2xl overflow-hidden">
                <div className="grid gap-3 px-4 py-2 text-[9px] font-semibold tracking-widest uppercase text-steel border-b border-black/[0.08]" style={{gridTemplateColumns:'36px 1fr 70px 60px 80px 80px'}}>
                  <div/><div>Student</div><div>Score</div><div>Fit</div><div>Joining</div><div>Action</div>
                </div>
                {filtered.map((s, i) => (
                  <div key={s.id||i} onClick={() => setSelected(s)} className="grid gap-3 px-4 py-3 border-b border-black/[0.06] hover:bg-[#F5F0E8] cursor-pointer items-center" style={{gridTemplateColumns:'36px 1fr 70px 60px 80px 80px'}}>
                    <Av initials={s.initials||'ST'} idx={i} size={32} />
                    <div>
                      <div className="text-xs font-medium text-navy">{s.initials}</div>
                      <div className="text-[10px] text-steel">{s.college_name}</div>
                    </div>
                    <div className="font-mono text-xs font-medium text-[#E8D000] bg-navy rounded px-2 py-0.5 inline-block">{s.fp_score}</div>
                    <div className="text-[11px] text-steel">{s.fit}%</div>
                    <div className="text-[11px] text-steel">{s.joining_timeline||'—'}</div>
                    <button onClick={e => { e.stopPropagation(); pool.some(p=>p.id===s.id) ? setPool(prev=>prev.filter(p=>p.id!==s.id)) : setPool(prev=>[...prev,s]) }}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded border ${pool.some(p=>p.id===s.id) ? 'bg-navy text-cream border-navy' : 'border-navy text-navy'}`}>
                      {pool.some(p=>p.id===s.id) ? '✓' : '+ Pool'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pool bar */}
          <div className="bg-navy px-5 py-3 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-[11px] font-medium text-cream tracking-widest uppercase">Pool</div>
              <div className="font-mono text-[11px] text-steel">{pool.length} candidates</div>
              <button onClick={submitPool} disabled={!pool.length || submitted}
                className={`ml-auto text-xs font-medium px-4 py-1.5 rounded-lg ${submitted ? 'bg-green-600 text-white' : pool.length ? 'bg-cream text-navy' : 'bg-cream/20 text-cream/30'}`}>
                {submitted ? '✓ Submitted' : 'Submit to First Principles →'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {pool.map((s, i) => (
                <div key={s.id||i} className="flex items-center gap-1.5 bg-cream/10 border border-steel/30 rounded-full px-3 py-1 text-[10px] text-cream/70">
                  {s.initials} · {(s.college_name||'').split(',')[0]}
                  <button onClick={() => setPool(prev=>prev.filter(p=>p.id!==s.id))} className="opacity-50 hover:opacity-100 ml-1">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile overlay */}
      {selected && (
        <div className="fixed inset-0 bg-[#F5F0E8] z-20 flex flex-col overflow-hidden">
          <div className="bg-navy px-6 py-3 flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="text-cream/60 text-xs hover:text-cream">← Back</button>
            <div className="ml-auto text-[10px] text-cream/30 tracking-widest">CANDIDATE PROFILE · HR VIEW</div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 max-w-2xl mx-auto w-full">
            <div className="bg-[#FAF7F2] border border-black/[0.08] rounded-2xl p-5 mb-4 flex items-start gap-4">
              <Av initials={selected.initials||'ST'} idx={0} size={64} />
              <div className="flex-1">
                <div className="font-serif italic text-navy text-xl mb-2">{selected.initials}</div>
                <div className="text-xs text-[#555] leading-loose">{selected.degree} · {selected.college_name}<br/>Available: {selected.joining_timeline||'—'}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[32px] font-medium text-[#E8D000] bg-navy rounded-xl px-3 py-2 leading-none inline-block">{selected.fp_score}</div>
                <div className="text-[10px] text-steel mt-1 tracking-widest uppercase">{selected.fp_tier}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#FAF7F2] border border-black/[0.08] rounded-2xl p-4">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-3">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.skills||[]).map((s: string) => <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-[#e8e4da] text-steel">{s}</span>)}
                </div>
              </div>
              <div className="bg-[#FAF7F2] border border-black/[0.08] rounded-2xl p-4">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-3">Target roles</div>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.target_roles||[]).map((r: string) => <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-[#EEF5FC] text-[#1660A8]">{r}</span>)}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { pool.some(p=>p.id===selected.id) ? setPool(prev=>prev.filter(p=>p.id!==selected.id)) : setPool(prev=>[...prev,selected]) }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-medium border ${pool.some(p=>p.id===selected.id) ? 'bg-navy text-cream border-navy' : 'border-navy text-navy'}`}>
                {pool.some(p=>p.id===selected.id) ? '✓ In pool' : '+ Add to pool'}
              </button>
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-lg text-xs font-medium border border-black/[0.08] text-steel">Back</button>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/[0.08]">
              <FPMark size={13} fill="#6486ac" />
              <div className="text-[10px] text-steel">First Principles · Confidential · For recruitment use only</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Av({ initials, idx, size }: { initials: string; idx: number; size: number }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={size/2} fill={BG[idx%BG.length]}/>
      <text x={size/2} y={size*0.67} textAnchor="middle" fontFamily="DM Sans" fontSize={size*0.28} fontWeight="500" fill="#fff8e6" letterSpacing="0.5">{initials}</text>
    </svg>
  )
}
