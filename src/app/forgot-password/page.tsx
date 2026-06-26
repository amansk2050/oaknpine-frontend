'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: authError } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (authError) {
        setError(authError.message || 'Something went wrong. Please try again.')
      } else {
        setSent(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,25%,97%)] px-4" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      {/* Background blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-100/60 blur-3xl pointer-events-none animate-blob" />
      <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-amber-100/40 blur-3xl pointer-events-none animate-blob" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 w-full max-w-md">

        {/* Back button */}
        <button
          id="forgot-back-btn"
          onClick={() => router.push('/login')}
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(220,9%,46%)] hover:text-[hsl(152,60%,28%)] transition-colors mb-8 font-medium"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to sign in
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 text-emerald-700">
            <path d="M16 3L6 14h5l-5 8h7v7h6v-7h7l-5-8h5L16 3z" fill="currentColor" />
          </svg>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-emerald-700">Pine</span>
            <span className="text-[hsl(222,47%,11%)]">Zone</span>
          </span>
        </div>

        {!sent ? (
          <div className="bg-white rounded-2xl border border-[hsl(220,13%,87%)] shadow-sm p-8">
            {/* Header */}
            <div className="mb-7">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 text-emerald-700">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-[hsl(222,47%,11%)] mb-2">Forgot your password?</h1>
              <p className="text-sm text-[hsl(220,9%,46%)] leading-relaxed">
                No worries. Enter your account email and we&apos;ll send you a secure link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="forgot-email" className="text-sm font-semibold text-[hsl(222,47%,11%)]">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@agency.com"
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(220,13%,87%)] bg-[hsl(220,14%,96%)] text-sm text-[hsl(222,47%,11%)] placeholder:text-[hsl(220,9%,65%)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[hsl(152,60%,28%)] hover:bg-[hsl(152,60%,22%)] text-white font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending reset link…
                  </span>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ── Success state ── */
          <div className="bg-white rounded-2xl border border-[hsl(220,13%,87%)] shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 text-emerald-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-[hsl(222,47%,11%)] mb-2">Check your inbox</h2>
            <p className="text-sm text-[hsl(220,9%,46%)] leading-relaxed mb-6">
              We&apos;ve sent a password reset link to <span className="font-semibold text-[hsl(222,47%,11%)]">{email}</span>.
              It expires in 1 hour.
            </p>
            <p className="text-xs text-[hsl(220,9%,60%)] mb-6">
              Didn&apos;t receive it? Check your spam folder, or{' '}
              <button
                id="resend-btn"
                type="button"
                onClick={() => { setSent(false) }}
                className="text-emerald-700 font-semibold hover:text-emerald-800 underline underline-offset-2 transition-colors"
              >
                try again
              </button>.
            </p>
            <button
              id="back-login-btn"
              onClick={() => router.push('/login')}
              className="w-full py-3 rounded-xl bg-[hsl(152,60%,28%)] hover:bg-[hsl(152,60%,22%)] text-white font-bold text-sm transition-all"
            >
              Back to sign in
            </button>
          </div>
        )}

        <p className="text-center text-xs text-[hsl(220,9%,60%)] mt-6">
          Remember your password?{' '}
          <a href="/login" className="text-emerald-700 font-semibold hover:text-emerald-800 transition-colors">
            Sign in
          </a>
        </p>

      </div>
    </div>
  )
}
