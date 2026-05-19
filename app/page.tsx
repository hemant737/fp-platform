'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { validateCollegeDomain } from '@/lib/colleges'
import { FPLogo } from '@/components/ui/Logo'

export default function StudentLogin() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function login() {
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return

    const { valid } = validateCollegeDomain(trimmed)

    if (!valid) {
      setError("This email isn't on our partner list yet. Contact your placement cell.")
      return
    }

    setLoading(true)
    const { error: e } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: `${window.location.origin}/student/onboard` }
    })
    setLoading(false)
    if (e) { setError(e.message); return }
    setSent(true)
  }

  if (sent) return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-[#F5F0E8] rounded-2xl p-10 max-w-sm w-full text-center">
        <FPMark />
        <div className="font-serif italic text-navy text-xl mt-4 mb-2">Check your inbox.</div>
        <div className="text-sm text-steel">Login link sent to <strong>{email.trim().toLowerCase()}</strong></div>
        <div className="text-xs text-steel/60 mt-2">Check spam if you don't see it.</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-[#F5F0E8] rounded-2xl p-10 max-w-sm w-full">
        <div className="mb-7"><FPLogo size="lg" variant="dark" /></div>
        <div className="font-serif italic text-navy text-xl mb-1">Welcome.</div>
        <div className="text-xs text-steel mb-6 leading-relaxed">Sign in with your college email to access your profile and FP Score.</div>
        <div className="mb-4">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-steel mb-1.5">College email</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="you@college.ac.in"
            className="w-full px-3 py-2.5 rounded-lg border border-black/10 bg-white text-sm text-navy outline-none focus:border-steel"
          />
        </div>
        {error && <div className="text-xs text-red-600 mb-3 leading-relaxed">{error}</div>}
        <button onClick={login} disabled={loading || !email.trim()}
          className="w-full py-2.5 bg-navy text-cream text-sm font-medium rounded-lg disabled:opacity-50">
          {loading ? 'Sending...' : 'Send login link →'}
        </button>
        <div className="text-xs text-steel text-center mt-4">New student? Your placement cell will send you an invite.</div>
      </div>
    </div>
  )
}

function FPMark() {
  return (
    <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center mx-auto">
      <svg width="22" height="19" viewBox="0 0 229.163 195.391">
        <path fill="#64ade0" d="M44.444,94.164l42.268,42.317,58.87-54.823-32.514,88.243h71.651V25.491L44.444,94.164Z"/>
      </svg>
    </div>
  )
}
