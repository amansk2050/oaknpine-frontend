'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setError('Invalid or expired reset link. Please request a new one.')
    }
  }, [token])

  // Password strength
  const strength = (() => {
    if (password.length === 0) return 0
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    return score
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-sky-500', 'bg-emerald-500'][strength]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!token) {
      setError('Invalid or expired reset link. Please request a new one.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const { error: authError } = await authClient.resetPassword({
        newPassword: password,
        token,
      })

      if (authError) {
        setError(authError.message || 'Reset failed. The link may have expired.')
      } else {
        setDone(true)
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

        {!done ? (
          <div className="bg-white rounded-2xl border border-[hsl(220,13%,87%)] shadow-sm p-8">
            {/* Header */}
            <div className="mb-7">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 text-emerald-700">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-[hsl(222,47%,11%)] mb-2">Set a new password</h1>
              <p className="text-sm text-[hsl(220,9%,46%)] leading-relaxed">
                Choose a strong password for your PineZone account. It must be at least 8 characters.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                  {!token && (
                    <div className="mt-2">
                      <a href="/forgot-password" className="font-semibold underline underline-offset-2">
                        Request a new link →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-password" className="text-sm font-semibold text-[hsl(222,47%,11%)]">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-[hsl(220,13%,87%)] bg-[hsl(220,14%,96%)] text-sm text-[hsl(222,47%,11%)] placeholder:text-[hsl(220,9%,65%)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,9%,55%)] hover:text-[hsl(222,47%,11%)] transition-colors"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password strength bar */}
                {password.length > 0 && (
                  <div className="mt-1">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(n => (
                        <div
                          key={n}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength ? strengthColor : 'bg-[hsl(220,13%,87%)]'}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${['', 'text-red-500', 'text-amber-500', 'text-sky-600', 'text-emerald-600'][strength]}`}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-confirm" className="text-sm font-semibold text-[hsl(222,47%,11%)]">
                  Confirm new password
                </label>
                <input
                  id="reset-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-[hsl(222,47%,11%)] placeholder:text-[hsl(220,9%,65%)] bg-[hsl(220,14%,96%)] focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-300 focus:ring-red-400/40 focus:border-red-400'
                      : 'border-[hsl(220,13%,87%)] focus:ring-emerald-500/40 focus:border-emerald-500'
                  }`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 font-medium">Passwords don&apos;t match</p>
                )}
              </div>

              <button
                id="reset-submit-btn"
                type="submit"
                disabled={loading || !token}
                className="w-full py-3 rounded-xl bg-[hsl(152,60%,28%)] hover:bg-[hsl(152,60%,22%)] text-white font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Updating password…
                  </span>
                ) : (
                  'Reset password'
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
            <h2 className="text-xl font-extrabold text-[hsl(222,47%,11%)] mb-2">Password updated!</h2>
            <p className="text-sm text-[hsl(220,9%,46%)] leading-relaxed mb-6">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button
              id="reset-done-btn"
              onClick={() => router.push('/login')}
              className="w-full py-3 rounded-xl bg-[hsl(152,60%,28%)] hover:bg-[hsl(152,60%,22%)] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg"
            >
              Sign in to PineZone
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
