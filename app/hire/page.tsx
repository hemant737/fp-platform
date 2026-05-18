'use client'
import { useState } from 'react'
import { FPLogo } from '@/components/ui/Logo'

export default function HireLogin() {
  const [form, setForm] = useState({ name: '', company: '', role: '', email: '' })
  const [stage, setStage] = useState<'login'|'request'|'sent'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function requestAccess() {
    if (!form.name || !form.company || !form.email) { setError('Please fill all fields.'); return }
    setLoading(true)
    const res = await fetch('/api/recruiter-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setLoading(false)
    if (res.ok) setStage('sent')
    else setError('Something went wrong.')
  }

  if (stage === 'sent') return (
    <Shell>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="17" viewBox="0 0 229.163 195.391"><path fill="#64ade0" d="M44.444,94.164l42.268,42.317,58.87-54.823-32.514,88.243h71.651V25.491L44.444,94.164Z"/></svg>
        </div>
        <div className="font-serif italic text-navy text-xl mb-2">Request received.</div>
        <div className="text-xs text-steel leading-relaxed">We'll send credentials to <strong>{form.email}</strong> within 24 hours.</div>
      </div>
    </Shell>
  )

  return (
    <Shell>
      <div className="mb-7"><FPLogo size="lg" variant="dark" /></div>
      {stage === 'login' ? (
        <>
          <div className="font-serif italic text-navy text-xl mb-1">Hire smarter.</div>
          <div className="text-xs text-steel mb-6 leading-relaxed">Access verified student profiles matched to your roles.</div>
          <div className="mb-3">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-steel mb-1.5">Work email</div>
            <input type="email" placeholder="you@company.com" className="w-full px-3 py-2.5 rounded-lg border border-black/10 bg-white text-sm text-navy outline-none focus:border-steel" />
          </div>
          <div className="mb-4">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-steel mb-1.5">Password</div>
            <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg border border-black/10 bg-white text-sm text-navy outline-none focus:border-steel" />
          </div>
          <button className="w-full py-2.5 bg-navy text-cream text-sm font-medium rounded-lg">Sign in →</button>
          <div className="text-xs text-steel text-center mt-4">
            No access yet? <button onClick={() => setStage('request')} className="text-navy font-medium underline">Request access</button>
          </div>
        </>
      ) : (
        <>
          <div className="font-serif italic text-navy text-xl mb-1">Request access.</div>
          <div className="text-xs text-steel mb-5">We'll review and respond within 24 hours.</div>
          {[['name','Your name'],['company','Company'],['role','Your role'],['email','Work email']].map(([f,p]) => (
            <div key={f} className="mb-3">
              <div className="text-[10px] font-semibold tracking-widest uppercase text-steel mb-1.5">{p}</div>
              <input type={f === 'email' ? 'email' : 'text'} value={(form as any)[f]} onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))} placeholder={p}
                className="w-full px-3 py-2.5 rounded-lg border border-black/10 bg-white text-sm text-navy outline-none focus:border-steel" />
            </div>
          ))}
          {error && <div className="text-xs text-red-600 mb-3">{error}</div>}
          <button onClick={requestAccess} disabled={loading} className="w-full py-2.5 bg-navy text-cream text-sm font-medium rounded-lg disabled:opacity-50 mt-1">
            {loading ? 'Submitting...' : 'Request access →'}
          </button>
          <button onClick={() => setStage('login')} className="w-full text-xs text-steel text-center mt-3">← Back</button>
        </>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-[#F5F0E8] rounded-2xl p-10 max-w-sm w-full">{children}</div>
    </div>
  )
}
