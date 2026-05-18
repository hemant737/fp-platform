'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FPLogo } from '@/components/ui/Logo'

const BG = ['#2C4A7C','#4A2C6B','#2C5A3F','#6B3A2C','#2C4A5A','#5A2C4A','#3A5A2C','#5A4A2C']

export default function AdminDashboard() {
  const [students, setStudents] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch() }, [])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false })
    setStudents(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('students').update({ status }).eq('id', id)
    setStudents(p => p.map(s => s.id === id ? { ...s, status } : s))
    if (selected?.id === id) setSelected((p: any) => ({ ...p, status }))
  }

  async function saveNote(id: string) {
    setSaving(true)
    await supabase.from('students').update({ mentor_note: note }).eq('id', id)
    setSaving(false)
  }

  const filtered = students.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false
    if (search && !s.name?.toLowerCase().includes(search) && !s.college_name?.toLowerCase().includes(search)) return false
    return true
  })

  const stats = {
    total: students.length,
    pending: students.filter(s => s.status === 'pending').length,
    verified: students.filter(s => s.status === 'verified').length,
    avg: students.length ? Math.round(students.reduce((a, s) => a + (s.fp_score || 0), 0) / students.length) : 0,
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <div className="bg-navy px-6 py-3 flex items-center gap-4">
        <FPLogo variant="light" />
        <div className="text-[10px] text-cream/30 tracking-widest">MENTOR DASHBOARD</div>
        <div className="ml-auto text-[10px] text-cream/40">hemant@firstprinciple.org.in</div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 52px)' }}>
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Stats */}
          <div className="grid grid-cols-4 border-b border-black/[0.08]">
            {[['Total students', stats.total, 'All colleges'], ['Pending', stats.pending, 'Awaiting review'], ['Verified', stats.verified, 'Recruiter visible'], ['Avg Score', stats.avg, 'Proficient band']].map(([l,v,s]) => (
              <div key={l} className="p-4 bg-[#FAF7F2] border-r border-black/[0.08] last:border-r-0">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-1">{l}</div>
                <div className="font-mono text-[22px] font-medium text-navy leading-none">{v}</div>
                <div className="text-[10px] text-steel mt-1">{s}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="px-4 py-2.5 bg-[#FAF7F2] border-b border-black/[0.08] flex items-center gap-3">
            <input value={search} onChange={e => setSearch(e.target.value.toLowerCase())} placeholder="Search..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-black/[0.08] bg-[#F5F0E8] text-xs outline-none focus:border-steel text-navy" />
            {['all','pending','verified','rejected'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`text-[10px] px-3 py-1.5 rounded-full border transition-all ${filter===s ? 'bg-navy text-cream border-navy' : 'border-black/[0.08] text-steel'}`}>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-[#F5F0E8]">
                <tr>
                  {['','Student','Score','Status','Joining','Actions'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[9px] font-semibold tracking-widest uppercase text-steel border-b border-black/[0.08]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-steel font-serif italic">Loading...</td></tr>
                ) : filtered.map((s, i) => (
                  <tr key={s.id} onClick={() => { setSelected(s); setNote(s.mentor_note||'') }}
                    className={`border-b border-black/[0.06] cursor-pointer hover:bg-[#F5F0E8] ${selected?.id===s.id ? 'bg-[#eae6de]' : 'bg-[#FAF7F2]'}`}>
                    <td className="px-3 py-2.5"><Av initials={s.initials||'ST'} idx={i} size={30} /></td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-navy">{s.name||s.email}</div>
                      <div className="text-[10px] text-steel">{s.college_name}</div>
                    </td>
                    <td className="px-3 py-2.5"><span className="font-mono text-[#E8D000] bg-navy rounded px-2 py-0.5">{s.fp_score||'—'}</span></td>
                    <td className="px-3 py-2.5"><StatusBadge status={s.status} /></td>
                    <td className="px-3 py-2.5 text-steel">{s.joining_timeline||'—'}</td>
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <button onClick={() => updateStatus(s.id, s.status==='verified'?'pending':'verified')}
                        className={`text-[10px] font-medium px-2.5 py-1 rounded border mr-1.5 ${s.status==='verified' ? 'bg-green-600 text-white border-green-600' : 'border-green-600 text-green-600'}`}>
                        {s.status==='verified' ? '✓ Verified' : 'Verify'}
                      </button>
                      <button onClick={() => updateStatus(s.id, s.status==='rejected'?'pending':'rejected')}
                        className={`text-[10px] font-medium px-2.5 py-1 rounded border ${s.status==='rejected' ? 'bg-red-600 text-white border-red-600' : 'border-red-600 text-red-600'}`}>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <div className={`w-64 flex-shrink-0 bg-[#FAF7F2] border-l border-black/[0.08] flex flex-col transition-all duration-200 ${selected ? '' : 'translate-x-full w-0 overflow-hidden'}`}>
          {selected && (
            <>
              <div className="p-4 border-b border-black/[0.08]">
                <div className="flex items-center gap-3 mb-3">
                  <Av initials={selected.initials||'ST'} idx={0} size={36} />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-navy">{selected.name}</div>
                    <div className="text-[10px] text-steel">{selected.college_name}</div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-steel hover:text-navy text-lg">×</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(selected.id, selected.status==='verified'?'pending':'verified')}
                    className={`flex-1 text-[10px] font-medium py-1.5 rounded border ${selected.status==='verified' ? 'bg-green-600 text-white border-green-600' : 'border-green-600 text-green-600'}`}>
                    {selected.status==='verified' ? '✓ Verified' : 'Verify'}
                  </button>
                  <button onClick={() => updateStatus(selected.id, selected.status==='rejected'?'pending':'rejected')}
                    className={`flex-1 text-[10px] font-medium py-1.5 rounded border ${selected.status==='rejected' ? 'bg-red-600 text-white border-red-600' : 'border-red-600 text-red-600'}`}>
                    Reject
                  </button>
                </div>
              </div>

              <div className="p-4 border-b border-black/[0.08]">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-2">FP Score</div>
                <div className="font-mono text-[28px] font-medium text-[#E8D000] bg-navy rounded-xl px-3 py-2 leading-none inline-block mb-1">{selected.fp_score||'—'}</div>
                <div className="text-[10px] text-steel tracking-widest uppercase">{selected.fp_tier}</div>
                <div className="mt-2 h-1 bg-[#e8e4da] rounded-full">
                  <div className="h-1 bg-navy rounded-full" style={{ width: `${selected.profile_completeness||0}%` }} />
                </div>
                <div className="text-[10px] text-steel mt-1">{selected.profile_completeness||0}% complete</div>
              </div>

              <div className="p-4 border-b border-black/[0.08]">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-2">Engine used</div>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${selected.gap_report?.engine === 'sonnet' ? 'bg-[#E8D000]/20 text-navy' : 'bg-steel/10 text-steel'}`}>
                  {selected.gap_report?.engine === 'sonnet' ? '★ Sonnet (Pro)' : 'Haiku (Free)'}
                </span>
              </div>

              <div className="p-4 flex-1">
                <div className="text-[9px] font-semibold tracking-widest uppercase text-steel mb-2">Mentor note</div>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..."
                  className="w-full h-20 px-2.5 py-2 text-xs bg-[#F5F0E8] border border-black/[0.08] rounded-lg outline-none resize-none text-navy focus:border-steel" />
                <button onClick={() => saveNote(selected.id)} disabled={saving}
                  className="w-full mt-2 py-2 bg-navy text-cream text-xs font-medium rounded-lg disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save note'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Av({ initials, idx, size }: { initials: string; idx: number; size: number }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={size/2} fill={BG[idx%BG.length]}/>
      <text x={size/2} y={size*0.68} textAnchor="middle" fontFamily="DM Sans" fontSize={size*0.3} fontWeight="500" fill="#fff8e6">{initials}</text>
    </svg>
  )
}

function StatusBadge({ status }: { status: string }) {
  const c: any = { verified: '#2E7D52', rejected: '#B0463E', pending: '#C8922A' }
  const l: any = { verified: 'Verified', rejected: 'Rejected', pending: 'Pending' }
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[#555]">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c[status]||'#aaa' }} />
      {l[status]||status}
    </span>
  )
}
