'use client'
// src/app/auth/register/page.tsx
// Multi-step registration: Details → Phone OTP → Google Email → CAPTCHA → Submit
/* global google */

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

// ─── Styles ─────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'system-ui',
    color: '#111', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box', background: 'white',
}
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#374151',
    marginBottom: 6, fontFamily: 'system-ui',
}
const stepBadge = (active: boolean, done: boolean): React.CSSProperties => ({
    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
    background: done ? '#22c55e' : active ? '#1a6cf6' : '#e5e7eb',
    color: done || active ? 'white' : '#9ca3af',
    transition: 'background 0.3s, color 0.3s',
})

const SPECIALTIES = [
    'General Surgery', 'Orthopaedics', 'Cardiology', 'Neurosurgery',
    'Ophthalmology', 'ENT', 'Urology', 'Gynaecology', 'Dermatology',
    'Plastic Surgery', 'Other',
]

// ─── CAPTCHA puzzle generator ────────────────────────────────────────────────
function generateCaptcha() {
    const a = Math.floor(Math.random() * 20) + 1
    const b = Math.floor(Math.random() * 20) + 1
    const ops = ['+', '-', '×'] as const
    const op = ops[Math.floor(Math.random() * ops.length)]
    let answer: number
    switch (op) {
        case '+': answer = a + b; break
        case '-': answer = a - b; break
        case '×': answer = a * b; break
    }
    return { question: `${a} ${op} ${b} = ?`, answer }
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner({ size = 16 }: { size?: number }) {
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
    )
}

export default function RegisterPage() {
    const router = useRouter()
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

    // Steps: 1=details, 2=phone-otp, 3=google-email, 4=captcha, 5=submitting
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Form fields (all mandatory)
    const [clinicName, setClinicName] = useState('')
    const [specialty, setSpecialty] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Verification states
    const [phoneVerified, setPhoneVerified] = useState(false)
    const [emailVerified, setEmailVerified] = useState(false)
    const [verifiedEmail, setVerifiedEmail] = useState('')
    const [captchaPassed, setCaptchaPassed] = useState(false)

    // OTP state
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [otpSending, setOtpSending] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [otpTimer, setOtpTimer] = useState(0)
    const [devOTP, setDevOTP] = useState<string | null>(null)
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])

    // CAPTCHA state
    const [captcha, setCaptcha] = useState(() => generateCaptcha())
    const [captchaAnswer, setCaptchaAnswer] = useState('')
    const [captchaChecked, setCaptchaChecked] = useState(false)

    // OTP countdown timer
    useEffect(() => {
        if (otpTimer <= 0) return
        const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
        return () => clearTimeout(t)
    }, [otpTimer])

    // ── Step 1: Validate and go to phone verification ──────────────────────────
    function handleStep1() {
        setError(null)
        if (!clinicName.trim()) { setError('Clinic name is required'); return }
        if (!specialty) { setError('Please select a specialty'); return }
        if (!name.trim()) { setError('Full name is required'); return }
        if (!phone.trim()) { setError('Phone number is required'); return }
        if (!/^\+[1-9]\d{6,14}$/.test(phone.trim())) { setError('Phone must be in international format e.g. +919876543210'); return }
        if (!password) { setError('Password is required'); return }
        if (password.length < 8) { setError('Password must be at least 8 characters'); return }
        if (password !== confirmPassword) { setError('Passwords do not match'); return }
        setStep(2)
    }

    // ── Step 2: Send OTP ────────────────────────────────────────────────────────
    async function handleSendOTP() {
        setError(null)
        setOtpSending(true)
        try {
            const res = await fetch('/api/auth/register/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone.trim() }),
            })
            const data = await res.json()
            if (!data.success) {
                setError(data.error || 'Failed to send OTP')
                setOtpSending(false)
                return
            }
            setOtpSent(true)
            setOtpTimer(60)
            // In dev mode, auto-fill the OTP
            if (data.devOTP) {
                setDevOTP(data.devOTP)
                setOtp(data.devOTP.split(''))
            } else {
                setOtp(['', '', '', '', '', ''])
            }
            setTimeout(() => otpRefs.current[0]?.focus(), 100)
        } catch {
            setError('Network error sending OTP')
        }
        setOtpSending(false)
    }

    // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
    async function handleVerifyOTP() {
        const code = otp.join('')
        if (code.length !== 6) { setError('Please enter all 6 digits'); return }
        setError(null)
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone.trim(), code }),
            })
            const data = await res.json()
            if (!data.success) {
                setError(data.error || 'Invalid OTP')
                setLoading(false)
                return
            }
            setPhoneVerified(true)
            setStep(3)
        } catch {
            setError('Verification failed')
        }
        setLoading(false)
    }

    function handleOtpChange(i: number, v: string) {
        if (!/^\d*$/.test(v)) return
        const n = [...otp]; n[i] = v.slice(-1); setOtp(n)
        setError(null)
        if (v && i < 5) otpRefs.current[i + 1]?.focus()
    }
    function handleOtpKey(i: number, e: React.KeyboardEvent) {
        if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
    }
    function handleOtpPaste(e: React.ClipboardEvent) {
        e.preventDefault()
        const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (p.length === 6) { setOtp(p.split('')); otpRefs.current[5]?.focus() }
    }

    // ── Step 3: Google OAuth email verification ─────────────────────────────────
    const handleGoogleResponse = useCallback((response: { credential: string }) => {
        try {
            // Decode JWT to get email (Google ID tokens are standard JWTs)
            const parts = response.credential.split('.')
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
            if (payload.email_verified && payload.email) {
                setVerifiedEmail(payload.email)
                setEmailVerified(true)
                setStep(4) // Go to CAPTCHA step
            } else {
                setError('Google account email is not verified. Please use a verified account.')
            }
        } catch {
            setError('Failed to verify Google account. Please try again.')
        }
    }, [])

    // Initialize Google Sign-In when we reach step 3
    useEffect(() => {
        if (step !== 3 || !GOOGLE_CLIENT_ID) return
        const timer = setTimeout(() => {
            if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
                (window as any).google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                });
                (window as any).google.accounts.id.renderButton(
                    document.getElementById('google-signin-btn'),
                    { theme: 'outline', size: 'large', width: 380, text: 'continue_with', shape: 'pill' }
                )
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [step, GOOGLE_CLIENT_ID, handleGoogleResponse])

    // ── Step 4: CAPTCHA ─────────────────────────────────────────────────────────
    function handleCaptchaVerify() {
        setError(null)
        if (!captchaChecked) { setError('Please check the "I\'m not a robot" box'); return }
        if (parseInt(captchaAnswer) !== captcha.answer) {
            setError('Incorrect answer. Please try again.')
            setCaptcha(generateCaptcha())
            setCaptchaAnswer('')
            return
        }
        setCaptchaPassed(true)
        handleFinalSubmit()
    }

    // ── Final: Submit registration ──────────────────────────────────────────────
    async function handleFinalSubmit() {
        setStep(5)
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/auth/doctor/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clinicName: clinicName.trim(),
                    name: name.trim(),
                    email: verifiedEmail || undefined,
                    phone: phone.trim(),
                    password,
                    specialty,
                }),
            })
            const data = await res.json()
            if (!data.success) {
                setError(data.error || 'Registration failed.')
                setStep(4)
                setLoading(false)
                return
            }
            setSuccess(`Welcome to ClinicOS, Dr. ${name.split(' ')[0]}! Redirecting to your dashboard...`)
            setTimeout(() => router.push('/dashboard'), 2000)
        } catch {
            setError('Network error. Please try again.')
            setStep(4)
            setLoading(false)
        }
    }

    // ── Steps indicator ─────────────────────────────────────────────────────────
    const steps = [
        { n: 1, label: 'Details' },
        { n: 2, label: 'Phone' },
        { n: 3, label: 'Email' },
        { n: 4, label: 'Verify' },
    ]

    return (
        <div style={{ minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column' }}>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ri:focus { border-color: #1a6cf6 !important; box-shadow: 0 0 0 3px rgba(26,108,246,0.1) !important; }
        .otp-i:focus { border-color: #1a6cf6 !important; box-shadow: 0 0 0 3px rgba(26,108,246,0.12) !important; }
      `}</style>

            {/* Google Identity Services script */}
            <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />

            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #f1f3f5' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1a6cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                            <circle cx="10" cy="10" r="3.5" fill="white" /><circle cx="10" cy="3" r="1.5" fill="white" opacity="0.7" />
                            <circle cx="10" cy="17" r="1.5" fill="white" opacity="0.7" /><circle cx="3" cy="10" r="1.5" fill="white" opacity="0.7" />
                            <circle cx="17" cy="10" r="1.5" fill="white" opacity="0.7" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#111', fontFamily: 'system-ui' }}>ClinicOS</span>
                </Link>
                <Link href="/auth/signin" style={{ padding: '8px 18px', borderRadius: 100, border: '1px solid #e2e4e9', color: '#374151', fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'system-ui' }}>
                    Sign in instead
                </Link>
            </header>

            {/* Main */}
            <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px' }}>
                <div style={{ width: '100%', maxWidth: 460 }}>

                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 14px' }}>🏥</div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 4px', fontFamily: 'system-ui' }}>Register your clinic</h1>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>14-day free trial · No credit card required</p>
                    </div>

                    {/* Step indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
                        {steps.map((s, i) => (
                            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <div style={stepBadge(step === s.n, step > s.n)}>{step > s.n ? '✓' : s.n}</div>
                                    <span style={{ fontSize: 10, color: step >= s.n ? '#111' : '#9ca3af', fontWeight: 600 }}>{s.label}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div style={{ width: 36, height: 2, background: step > s.n ? '#22c55e' : '#e5e7eb', borderRadius: 1, marginBottom: 14 }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Messages */}
                    {error && <div style={{ fontSize: 13, color: '#dc2626', padding: '10px 14px', background: '#fef2f2', borderRadius: 10, marginBottom: 14, fontFamily: 'system-ui', border: '1px solid #fecaca' }}>{error}</div>}
                    {success && <div style={{ fontSize: 13, color: '#16a34a', padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, marginBottom: 14, fontFamily: 'system-ui', border: '1px solid #bbf7d0' }}>{success}</div>}

                    {/* ═══════════════ STEP 1: DETAILS ═══════════════ */}
                    {step === 1 && (
                        <div>
                            <div style={{ padding: '16px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f3f4f6', marginBottom: 14 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 12 }}>Clinic Details</div>
                                <div style={{ marginBottom: 12 }}>
                                    <label style={labelStyle}>Clinic Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input className="ri" type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="City Orthopaedic Centre" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Specialty <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select className="ri" value={specialty} onChange={e => setSpecialty(e.target.value)} style={{ ...inputStyle, appearance: 'auto', cursor: 'pointer' }}>
                                        <option value="">Select your specialty</option>
                                        {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f3f4f6', marginBottom: 14 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 12 }}>Doctor Details</div>
                                <div style={{ marginBottom: 12 }}>
                                    <label style={labelStyle}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input className="ri" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Amandeep Singh" style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <label style={labelStyle}>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input className="ri" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+919876543210" style={inputStyle} />
                                    <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, display: 'block' }}>International format required. Will be verified via OTP.</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={labelStyle}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input className="ri" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input className="ri" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" style={inputStyle} />
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleStep1} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: '#1a6cf6', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui', boxShadow: '0 4px 14px rgba(26,108,246,0.25)' }}>
                                Continue → Verify Phone
                            </button>
                        </div>
                    )}

                    {/* ═══════════════ STEP 2: PHONE OTP ═══════════════ */}
                    {step === 2 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>📱</div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>Verify your phone number</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>
                                We&apos;ll send a 6-digit OTP to <strong>{phone}</strong>
                            </p>

                            {devOTP && (
                                <div style={{ fontSize: 13, color: '#92400e', padding: '10px 14px', background: '#fefce8', borderRadius: 10, marginBottom: 14, border: '1px solid #fef08a', textAlign: 'left' }}>
                                    <strong>🔧 Dev Mode:</strong> OTP is <code style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>{devOTP}</code>
                                </div>
                            )}

                            {!otpSent ? (
                                <button onClick={handleSendOTP} disabled={otpSending} style={{
                                    padding: '13px 32px', borderRadius: 12, border: 'none', background: otpSending ? '#93c5fd' : '#1a6cf6',
                                    color: 'white', fontSize: 15, fontWeight: 700, cursor: otpSending ? 'not-allowed' : 'pointer', fontFamily: 'system-ui',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto',
                                }}>
                                    {otpSending ? <><Spinner /> Sending...</> : 'Send OTP'}
                                </button>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                                        {otp.map((d, i) => (
                                            <input
                                                key={i} ref={el => { otpRefs.current[i] = el }} className="otp-i"
                                                type="text" inputMode="numeric" maxLength={1} value={d}
                                                onChange={e => handleOtpChange(i, e.target.value)}
                                                onKeyDown={e => handleOtpKey(i, e)}
                                                onPaste={i === 0 ? handleOtpPaste : undefined}
                                                style={{ width: 44, height: 52, borderRadius: 10, border: '2px solid #d1d5db', fontSize: 22, fontWeight: 700, textAlign: 'center', fontFamily: 'monospace', color: '#111', outline: 'none', transition: 'border-color 0.15s' }}
                                            />
                                        ))}
                                    </div>

                                    <button onClick={handleVerifyOTP} disabled={loading || otp.join('').length !== 6} style={{
                                        width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                                        background: otp.join('').length === 6 && !loading ? '#1a6cf6' : '#e5e7eb',
                                        color: otp.join('').length === 6 && !loading ? 'white' : '#9ca3af',
                                        fontSize: 15, fontWeight: 700, cursor: otp.join('').length === 6 && !loading ? 'pointer' : 'not-allowed', fontFamily: 'system-ui',
                                        marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    }}>
                                        {loading ? <><Spinner /> Verifying...</> : 'Verify OTP'}
                                    </button>

                                    <button onClick={handleSendOTP} disabled={otpTimer > 0 || otpSending} style={{
                                        background: 'none', border: 'none', color: otpTimer > 0 ? '#9ca3af' : '#1a6cf6',
                                        fontSize: 13, fontWeight: 600, cursor: otpTimer > 0 ? 'default' : 'pointer', fontFamily: 'system-ui',
                                    }}>
                                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                                    </button>
                                </div>
                            )}

                            <button onClick={() => { setStep(1); setError(null) }} style={{ marginTop: 16, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontFamily: 'system-ui' }}>
                                ← Back to details
                            </button>
                        </div>
                    )}

                    {/* ═══════════════ STEP 3: GOOGLE OAUTH EMAIL ═══════════════ */}
                    {step === 3 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>✉️</div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>Verify your email</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 8px' }}>
                                Sign in with Google to verify your email address
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                                <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Phone verified ✓</span>
                            </div>

                            {GOOGLE_CLIENT_ID ? (
                                <div>
                                    <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }} />
                                    <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
                                        We only access your email for verification.<br />No data is stored from your Google account.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6, padding: '12px', background: '#fefce8', borderRadius: 8, border: '1px solid #fef08a' }}>
                                        <strong>Google OAuth not configured.</strong><br />
                                        Add <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to your <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>.env.local</code> file, or skip this step.
                                    </p>
                                    <button onClick={() => setStep(4)} style={{
                                        padding: '13px 32px', borderRadius: 12, border: 'none', background: '#1a6cf6',
                                        color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui',
                                    }}>
                                        Skip → Continue to CAPTCHA
                                    </button>
                                </div>
                            )}

                            <button onClick={() => { setStep(2); setError(null) }} style={{ marginTop: 16, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontFamily: 'system-ui' }}>
                                ← Back
                            </button>
                        </div>
                    )}

                    {/* ═══════════════ STEP 4: CAPTCHA ═══════════════ */}
                    {step === 4 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>🤖</div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>Verify you&apos;re not a robot</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>Complete this quick check to finish registration</p>

                            {/* Status badges */}
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, padding: '4px 12px', background: '#f0fdf4', borderRadius: 20, border: '1px solid #bbf7d0' }}>✓ Phone verified</span>
                                {emailVerified && <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, padding: '4px 12px', background: '#f0fdf4', borderRadius: 20, border: '1px solid #bbf7d0' }}>✓ Email: {verifiedEmail}</span>}
                            </div>

                            {/* CAPTCHA box */}
                            <div style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', maxWidth: 360, margin: '0 auto 20px', textAlign: 'left' }}>
                                {/* Checkbox row */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 16 }}>
                                    <input
                                        type="checkbox"
                                        checked={captchaChecked}
                                        onChange={e => setCaptchaChecked(e.target.checked)}
                                        style={{ width: 20, height: 20, accentColor: '#1a6cf6', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>I&apos;m not a robot</span>
                                </label>

                                {/* Math challenge */}
                                {captchaChecked && (
                                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
                                        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Solve this to continue:</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: 20, fontWeight: 800, color: '#111', fontFamily: 'monospace', background: '#e0e7ff', padding: '8px 16px', borderRadius: 8 }}>
                                                {captcha.question}
                                            </span>
                                            <input
                                                className="ri"
                                                type="text"
                                                value={captchaAnswer}
                                                onChange={e => setCaptchaAnswer(e.target.value)}
                                                placeholder="Answer"
                                                style={{ ...inputStyle, width: 80, textAlign: 'center', fontSize: 16, fontWeight: 700 }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={handleCaptchaVerify} disabled={loading} style={{
                                width: '100%', maxWidth: 360, padding: '13px', borderRadius: 12, border: 'none',
                                background: loading ? '#93c5fd' : '#22c55e', color: 'white', fontSize: 15, fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'system-ui', margin: '0 auto',
                                boxShadow: '0 4px 14px rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}>
                                {loading ? <><Spinner /> Creating your clinic...</> : '✓ Create Clinic & Start Free Trial'}
                            </button>

                            <button onClick={() => { setStep(3); setError(null) }} style={{ marginTop: 16, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontFamily: 'system-ui' }}>
                                ← Back
                            </button>
                        </div>
                    )}

                    {/* ═══════════════ STEP 5: SUBMITTING ═══════════════ */}
                    {step === 5 && !success && (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#1a6cf6', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
                            <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 600 }}>Creating your clinic...</p>
                        </div>
                    )}

                    {/* Trial benefits (show on step 1) */}
                    {step === 1 && (
                        <div style={{ marginTop: 16, padding: '14px 16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #dbeafe' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#1e40af', marginBottom: 6 }}>Your free trial includes:</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                {['AI Clinical Copilot', 'Patient Management', 'Task Automation', 'Billing Intelligence', 'Risk Monitoring', 'Unlimited Users'].map(f => (
                                    <div key={f} style={{ fontSize: 12, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ color: '#22c55e', fontSize: 14 }}>✓</span> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Terms */}
                    <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 16, lineHeight: 1.6, fontFamily: 'system-ui' }}>
                        By registering, you agree to ClinicOS&apos;s{' '}
                        <a href="#" style={{ color: '#1a6cf6', textDecoration: 'none' }}>Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" style={{ color: '#1a6cf6', textDecoration: 'none' }}>Privacy Policy</a>.
                    </p>
                </div>
            </main>
        </div>
    )
}
