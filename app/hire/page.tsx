'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FPLogo } from '@/components/ui/Logo'

const HIRE_PASSWORD = 'hire2024'

export default function HireLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function login() {
    setError('')
    if (!email.trim()) return
    if (password !== HIRE_PASSWORD) {
      setError('Incorrect password. Contact First Principles for access.')
      return
    }
    sessionStorage.setItem('fp_hire_email', email.trim().toLowerCase())
    sessionStorage.setItem('fp_hire_authed', 'true')
    router.push('/hire/dashboard')
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-[#F5F0E8] rounded-2xl p-10 max-w-sm w-full">
        <div className="mb-7"><FPLogo size="lg" variant="dark" /></div>
        <div className="font-serif italic text-navy text-xl mb-1">Hire smarter.</div>
        <div className="text-xs text-steel mb-6 leading-relaxed">Access verified student profiles matched to your roles.</div>
        <div className="mb-3">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-steel mb-1.5">Work email</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="you@company.com" className="w-full px-3 py-2.5 rounded-lg border border-black/10 bg-white text-sm text-navy outline-none focus:border-steel" />
        </div>
        <div className="mb-4">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-steel mb-1.5">Password</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg border border-black/10 bg-white text-sm text-navy outline-none focus:border-steel" />
        </div>
        {error && <div className="text-xs text-red-600 mb-3 leading-relaxed">{error}</div>}
        <button onClick={login} disabled={!email.trim() || !password} className="w-full py-2.5 bg-navy text-cream text-sm font-medium rounded-lg disabled:opacity-50">Sign in →</button>
        <div className="text-xs text-steel text-center mt-4">Need access? Contact First Principles.</div>
      </div>
    </div>
  )
}
