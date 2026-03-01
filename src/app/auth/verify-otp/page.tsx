'use client'
// src/app/auth/verify-otp/page.tsx
// OTP verification page — user enters 6-digit code after OTP is sent

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyOTPPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const phone = searchParams.get('phone') ?? ''
    const clinicId = searchParams.get('clinicId') ?? ''
    const userType = searchParams.get('userType') ?? 'DOCTOR'

    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    function handleChange(index: number, value: string) {
        if (!/^\d*$/.test(value)) return
        const newCode = [...code]
        newCode[index] = value.slice(-1)
        setCode(newCode)
        setError(null)

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    function handleKeyDown(index: number, e: React.KeyboardEvent) {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    function handlePaste(e: React.ClipboardEvent) {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length === 6) {
            setCode(pasted.split(''))
            inputRefs.current[5]?.focus()
        }
    }

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault()
        const otpCode = code.join('')
        if (otpCode.length !== 6 || loading) return
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code: otpCode, clinicId, userType }),
            })
            const data = await res.json()

            if (!data.success) {
                setError(data.error || 'Verification failed')
                setLoading(false)
                return
            }

            setSuccess('Verified! Redirecting...')
            router.push('/dashboard')
        } catch {
            setError('Network error. Please try again.')
            setLoading(false)
        }
    }

    async function handleResend() {
        setError(null)
        try {
            const endpoint = userType === 'PATIENT'
                ? '/api/auth/patient/login'
                : '/api/auth/otp/send'
            const body = userType === 'PATIENT'
                ? { phone, clinicId }
                : { phone, clinicId, userType, channel: 'sms' }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (data.success) {
                setCode(['', '', '', '', '', ''])
                inputRefs.current[0]?.focus()
                setError(null)
                setSuccess('OTP resent successfully!')
                setTimeout(() => setSuccess(null), 3000)
            } else {
                setError(data.error || 'Failed to resend OTP')
            }
        } catch {
            setError('Failed to resend OTP')
        }
    }

    const inputStyle: React.CSSProperties = {
        width: 48,
        height: 56,
        borderRadius: 12,
        border: '2px solid #d1d5db',
        fontSize: 24,
        fontWeight: 700,
        textAlign: 'center',
        fontFamily: 'monospace',
        color: '#111',
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
    }

    return (
        <div style={{ minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column' }}>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .otp-input:focus { border-color: #1a6cf6 !important; box-shadow: 0 0 0 3px rgba(26,108,246,0.12) !important; }
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
            </header>

            {/* Main */}
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 24px' }}>🔐</div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 8px', fontFamily: 'system-ui' }}>Enter verification code</h1>
                    <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
                        We sent a 6-digit code to <strong>{phone}</strong>.<br />It expires in 1 minute.
                    </p>

                    {error && (
                        <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 16px', fontFamily: 'system-ui', padding: '10px', background: '#fef2f2', borderRadius: 8 }}>{error}</p>
                    )}
                    {success && (
                        <p style={{ fontSize: 13, color: '#16a34a', margin: '0 0 16px', fontFamily: 'system-ui', padding: '10px', background: '#f0fdf4', borderRadius: 8 }}>{success}</p>
                    )}

                    <form onSubmit={handleVerify}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                            {code.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputRefs.current[i] = el }}
                                    className="otp-input"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onPaste={i === 0 ? handlePaste : undefined}
                                    style={inputStyle}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || code.join('').length !== 6}
                            style={{
                                width: '100%',
                                padding: '13px 20px',
                                borderRadius: 12,
                                border: 'none',
                                background: code.join('').length === 6 && !loading ? '#1a6cf6' : '#e5e7eb',
                                color: code.join('').length === 6 && !loading ? 'white' : '#9ca3af',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: code.join('').length === 6 && !loading ? 'pointer' : 'not-allowed',
                                fontFamily: 'system-ui',
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>

                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button onClick={handleResend} style={{ background: 'none', border: 'none', color: '#1a6cf6', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui' }}>
                            Resend code
                        </button>
                        <Link href="/auth/signin" style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none', fontFamily: 'system-ui' }}>
                            ← Back to sign in
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
