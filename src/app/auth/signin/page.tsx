'use client'
// src/app/auth/signin/page.tsx
// ClinicOS Sign In — Phone+OTP and Email+Password login
// NO Google, Apple, Microsoft, SSO (as per auth integration guide)

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function Spinner() {
  return (
    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#1a6cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12" y2="18" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#1a6cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

const btnBase: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  padding: '13px 20px',
  borderRadius: 12,
  border: '1px solid #e2e4e9',
  background: 'white',
  fontSize: 14,
  fontWeight: 500,
  color: '#1a1a1a',
  cursor: 'pointer',
  transition: 'border-color 0.15s, background 0.15s',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  outline: 'none',
}

type LoginMode = 'select' | 'phone' | 'email'

export default function SignInPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('select')
  const [phone, setPhone] = useState('')
  const [clinicId, setClinicId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ── Phone + OTP Login ────────────────────────────────────────────────────
  async function handlePhoneLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!phone || !clinicId || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, clinicId, userType: 'DOCTOR', channel: 'sms' }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to send OTP')
        setLoading(false)
        return
      }

      // Redirect to OTP verification page
      const params = new URLSearchParams({ phone, clinicId, userType: 'DOCTOR' })
      router.push(`/auth/verify-otp?${params.toString()}`)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  // ── Email + Password Login ───────────────────────────────────────────────
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      setSuccess('Login successful! Redirecting...')
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-btn:hover { background: #f8f9fb !important; border-color: #c8cdd6 !important; }
        .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .auth-input:focus { border-color: #1a6cf6 !important; box-shadow: 0 0 0 3px rgba(26,108,246,0.12) !important; }
      `}</style>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #f1f3f5' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1a6cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <circle cx="10" cy="10" r="3.5" fill="white" />
              <circle cx="10" cy="3" r="1.5" fill="white" opacity="0.7" />
              <circle cx="10" cy="17" r="1.5" fill="white" opacity="0.7" />
              <circle cx="3" cy="10" r="1.5" fill="white" opacity="0.7" />
              <circle cx="17" cy="10" r="1.5" fill="white" opacity="0.7" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#111', fontFamily: 'system-ui' }}>ClinicOS</span>
        </Link>
        <Link href="/auth/signin" style={{ padding: '8px 18px', borderRadius: 100, background: '#1a6cf6', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'system-ui' }}>
          Sign up for free
        </Link>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', textAlign: 'center', margin: '0 0 32px', fontFamily: 'system-ui, -apple-system' }}>
            Log in to ClinicOS
          </h1>

          {/* Error / Success */}
          {error && (
            <p style={{ fontSize: 13, color: '#dc2626', textAlign: 'center', margin: '0 0 16px', fontFamily: 'system-ui', padding: '10px', background: '#fef2f2', borderRadius: 8 }}>{error}</p>
          )}
          {success && (
            <p style={{ fontSize: 13, color: '#16a34a', textAlign: 'center', margin: '0 0 16px', fontFamily: 'system-ui', padding: '10px', background: '#f0fdf4', borderRadius: 8 }}>{success}</p>
          )}

          {/* Mode selection */}
          {mode === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="auth-btn" onClick={() => { setMode('phone'); setError(null) }} style={btnBase}>
                <PhoneIcon /> Sign in with Phone + OTP
              </button>
              <button className="auth-btn" onClick={() => { setMode('email'); setError(null) }} style={btnBase}>
                <EmailIcon /> Sign in with Email + Password
              </button>
            </div>
          )}

          {/* Phone + OTP form */}
          {mode === 'phone' && (
            <form onSubmit={handlePhoneLogin}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, fontFamily: 'system-ui' }}>
                Phone number (international format)
              </label>
              <input
                className="auth-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'system-ui', color: '#111', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
              />

              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, fontFamily: 'system-ui' }}>
                Clinic ID
              </label>
              <input
                className="auth-input"
                type="text"
                value={clinicId}
                onChange={(e) => setClinicId(e.target.value)}
                placeholder="Your clinic identifier"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'system-ui', color: '#111', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
              />

              <button
                type="submit"
                disabled={loading || !phone || !clinicId}
                style={{ ...btnBase, background: phone && clinicId && !loading ? '#1a6cf6' : '#e5e7eb', color: phone && clinicId && !loading ? 'white' : '#9ca3af', border: 'none', fontWeight: 600 }}
              >
                {loading ? <><Spinner /> Sending OTP...</> : 'Send OTP'}
              </button>

              <button type="button" onClick={() => { setMode('select'); setError(null) }} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: '#1a6cf6', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui' }}>
                ← Back to options
              </button>
            </form>
          )}

          {/* Email + Password form */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, fontFamily: 'system-ui' }}>
                Email
              </label>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@clinic.com"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'system-ui', color: '#111', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
              />

              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, fontFamily: 'system-ui' }}>
                Password
              </label>
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'system-ui', color: '#111', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
              />

              <button
                type="submit"
                disabled={loading || !email || !password}
                style={{ ...btnBase, background: email && password && !loading ? '#1a6cf6' : '#e5e7eb', color: email && password && !loading ? 'white' : '#9ca3af', border: 'none', fontWeight: 600 }}
              >
                {loading ? <><Spinner /> Signing in...</> : 'Sign In'}
              </button>

              <button type="button" onClick={() => { setMode('select'); setError(null) }} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: '#1a6cf6', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui' }}>
                ← Back to options
              </button>
            </form>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', fontFamily: 'system-ui' }}>new here?</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          <Link href="/auth/register" style={{ ...btnBase, textDecoration: 'none', textAlign: 'center' } as React.CSSProperties}>
            Register your clinic
          </Link>

          {/* Terms */}
          <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 20, lineHeight: 1.6, fontFamily: 'system-ui' }}>
            By signing up, you acknowledge that you have read and understood, and agree to ClinicOS&apos;s{' '}
            <a href="#" style={{ color: '#1a6cf6', textDecoration: 'none' }}>Terms</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#1a6cf6', textDecoration: 'none' }}>Privacy Policy</a>.
          </p>
        </div>
      </main>
    </div>
  )
}
