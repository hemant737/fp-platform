'use client'
import { useState } from 'react'
import { validateCollegeDomain } from '@/lib/colleges'
import { FPLogo } from '@/components/ui/Logo'

export default function StudentLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function login() {
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return

    const { valid } = validateCollegeDomain(trimmed)
    if (!valid) {
      setError("This email isn't on our partner list yet.")
      return
    }

    if (password !== 'student2024') {
      setError('Incorrect password.')
      return
    }

    // Store session and go to onboarding
    sessionStorage.setItem('fp_email', trimmed)
    sessionStorage.setItem('fp_authed', 'true')
    window.location.href = '/student/onboard'
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-[#F5F0E8] rounded-2xl p-10 max-w-sm w-full">
        <div className="mb-7"><FPLogo size="lg" variant="dark" /></div>
        <div className="font-serif italic text-navy text-xl mb-1">Welcome.</div>
        <div className="text-xs text-steel mb-6 leading-relaxed">Sign in with your college email to access your profile and FP Score.</div>
        <div className="mb-3">
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
        <div className="mb-4">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-steel mb-1.5">Password</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 rounded-lg border border-black/10 bg-white text-sm text-navy outline-none focus:border-steel"
          />
        </div>
        {error && <div className="text-xs text-red-600 mb-3">{error}</div>}
        <button
          onClick={login}
          disabled={!email.trim() || !password}
          className="w-full py-2.5 bg-navy text-cream text-sm font-medium rounded-lg disabled:opacity-50"
        >
          Sign in →
        </button>
        <div className="text-xs text-steel text-center mt-4">New student? Your placement cell will send you an invite.</div>
      </div>
    </div>
  )
}
