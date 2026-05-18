'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FPLogo } from '@/components/ui/Logo'

const ADMINS = ['hemant@firstprinciple.org.in', 'samarth@firstprinciple.org.in']

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function login() {
    if (!ADMINS.includes(email.toLowerCase())) { setError('Access restricted to First Principles mentors only.'); return }
    const { error: e } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` } })
    if (e) { setError(e.message); return }
    setSent(true)
  }

  if (sent) return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="bg-[#F5F0E8] rounded-2xl p-10 max-w-sm w-full text-center">
        <div className="font-serif italic text-navy text-xl mb-2">Check your inbox.</div>
        <div className="text-xs text-steel">Login link sent to <strong>{email}</strong></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="bg-[#F5F0E8] rounded-2xl p-10 max-w-sm w-full">
        <div className="mb-7"><FPLogo size="lg" variant="dark" /></div>
        <div className="font-serif italic text-navy text-xl mb-1">Mentor access.</div>
        <div className="text-xs text-steel mb-6">Restricted to First Principles mentors.</div>
        <div className="mb-4">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-steel mb-1.5">Mentor email</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="you@firstprinciple.org.in"
            className="w-full px-3 py-2.5 rounded-lg border border-black/10 bg-white text-sm text-navy outline-none focus:border-steel" />
        </div>
        {error && <div className="text-xs text-red-600 mb-3">{error}</div>}
        <button onClick={login} disabled={!email} className="w-full py-2.5 bg-navy text-cream text-sm font-medium rounded-lg disabled:opacity-50">Send login link →</button>
      </div>
    </div>
  )
}
