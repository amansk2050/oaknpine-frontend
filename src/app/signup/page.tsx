'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

const STEPS = ['Account', 'Workspace', 'Done']

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('inviteToken')
  const inviteEmail = searchParams.get('email') || ''

  // Step state
  const [step, setStep] = useState(0)

  // Step 1 — Account fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState(inviteEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Step 2 — Workspace / Org fields
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgEmail, setOrgEmail] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-generate slug from org name
  function handleOrgNameChange(value: string) {
    setOrgName(value)
    setOrgSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 40)
    )
  }

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
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-sky-500', 'bg-emerald-500'][strength]
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]

  /* ── Step 1 submit ── */
  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const { data: signUpData, error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
      })

      if (signUpError || !signUpData) {
        setError(signUpError?.message || 'Could not create account. Email may already be in use.')
        return
      }

      setStep(1)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 2 submit — create org and link user ── */
  async function handleWorkspaceSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orgSlug) {
      setError('Workspace URL is required.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      // Create organization (workspace) for the logged in user
      const { error: orgError } = await authClient.organization.create({
        name: orgName,
        slug: orgSlug,
        phone: orgPhone || undefined,
        email: orgEmail || undefined,
      })

      if (orgError) {
        setError(orgError.message || 'Could not create workspace.')
        return
      }

      setStep(2)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[hsl(220,25%,97%)] px-4 py-12"
      style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
    >
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

        {/* Step indicator */}
        {step < 2 && (
          <div className="flex items-center gap-2 mb-6">
            {STEPS.slice(0, 2).map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                  i === step
                    ? 'bg-emerald-700 text-white'
                    : i < step
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-[hsl(220,13%,87%)] text-[hsl(220,9%,55%)]'
                }`}>
                  <span className="w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold">
                    {i < step ? '✓' : i + 1}
                  </span>
                  {label}
                </div>
                {i < 1 && <div className={`w-8 h-0.5 rounded-full ${step > i ? 'bg-emerald-400' : 'bg-[hsl(220,13%,87%)]'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 0: Account ── */}
        {step === 0 && (
          <div className="bg-white rounded-2xl border border-[hsl(220,13%,87%)] shadow-sm p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold text-[hsl(222,47%,11%)] mb-1.5">Create your account</h1>
              <p className="text-sm text-[hsl(220,9%,46%)]">Start your 14-day free trial. No credit card needed.</p>
            </div>

            <form onSubmit={handleAccountSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-name" className="text-sm font-semibold text-[hsl(222,47%,11%)]">Full name</label>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Sheikh Aman"
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(220,13%,87%)] bg-[hsl(220,14%,96%)] text-sm text-[hsl(222,47%,11%)] placeholder:text-[hsl(220,9%,65%)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-email" className="text-sm font-semibold text-[hsl(222,47%,11%)]">Work email</label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@agency.com"
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(220,13%,87%)] bg-[hsl(220,14%,96%)] text-sm text-[hsl(222,47%,11%)] placeholder:text-[hsl(220,9%,65%)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-password" className="text-sm font-semibold text-[hsl(222,47%,11%)]">Password</label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-[hsl(220,13%,87%)] bg-[hsl(220,14%,96%)] text-sm text-[hsl(222,47%,11%)] placeholder:text-[hsl(220,9%,65%)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,9%,55%)] hover:text-[hsl(222,47%,11%)] transition-colors">
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-1">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength ? strengthColor : 'bg-[hsl(220,13%,87%)]'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${['', 'text-red-500', 'text-amber-500', 'text-sky-600', 'text-emerald-600'][strength]}`}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              <button
                id="signup-next-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[hsl(152,60%,28%)] hover:bg-[hsl(152,60%,22%)] text-white font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  'Continue →'
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 1: Workspace ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-[hsl(220,13%,87%)] shadow-sm p-8">
            <div className="mb-7">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 text-emerald-700">
                  <rect x="2" y="3" width="20" height="18" rx="2" />
                  <path d="M8 10h8M8 14h5" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-[hsl(222,47%,11%)] mb-1.5">Name your workspace</h2>
              <p className="text-sm text-[hsl(220,9%,46%)]">This is your agency&apos;s home in PineZone. You can change it later.</p>
            </div>

            <form onSubmit={handleWorkspaceSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              {/* Agency name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="org-name" className="text-sm font-semibold text-[hsl(222,47%,11%)]">Agency / business name</label>
                <input
                  id="org-name"
                  type="text"
                  required
                  value={orgName}
                  onChange={e => handleOrgNameChange(e.target.value)}
                  placeholder="Darjeeling Hills Retreat"
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(220,13%,87%)] bg-[hsl(220,14%,96%)] text-sm text-[hsl(222,47%,11%)] placeholder:text-[hsl(220,9%,65%)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Slug preview */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="org-slug" className="text-sm font-semibold text-[hsl(222,47%,11%)]">Workspace URL</label>
                <div className="flex items-center rounded-xl border border-[hsl(220,13%,87%)] bg-[hsl(220,14%,96%)] overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500 transition-all">
                  <span className="px-3 py-3 text-sm text-[hsl(220,9%,55%)] bg-[hsl(220,13%,91%)] border-r border-[hsl(220,13%,87%)] select-none whitespace-nowrap">
                    pinezone.app/
                  </span>
                  <input
                    id="org-slug"
                    type="text"
                    required
                    value={orgSlug}
                    onChange={e => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 40))}
                    placeholder="my-agency"
                    className="flex-1 px-3 py-3 bg-transparent text-sm text-[hsl(222,47%,11%)] placeholder:text-[hsl(220,9%,65%)] focus:outline-none"
                  />
                </div>
                <p className="text-xs text-[hsl(220,9%,55%)]">Only lowercase letters, numbers, and hyphens.</p>
              </div>

              {/* Business Phone */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="org-phone" className="text-sm font-semibold text-[hsl(222,47%,11%)]">Business Phone (Optional)</label>
                <input
                  id="org-phone"
                  type="text"
                  value={orgPhone}
                  onChange={e => setOrgPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(220,13%,87%)] bg-[hsl(220,14%,96%)] text-sm text-[hsl(222,47%,11%)] placeholder:text-[hsl(220,9%,65%)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Business Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="org-email" className="text-sm font-semibold text-[hsl(222,47%,11%)]">Business Email (Optional)</label>
                <input
                  id="org-email"
                  type="email"
                  value={orgEmail}
                  onChange={e => setOrgEmail(e.target.value)}
                  placeholder="contact@agency.com"
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(220,13%,87%)] bg-[hsl(220,14%,96%)] text-sm text-[hsl(222,47%,11%)] placeholder:text-[hsl(220,9%,65%)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  id="signup-back-btn"
                  onClick={() => { setStep(0); setError(null) }}
                  className="flex-1 py-3 rounded-xl border border-[hsl(220,13%,87%)] text-[hsl(222,47%,11%)] font-semibold text-sm hover:bg-[hsl(220,14%,93%)] transition-colors"
                >
                  ← Back
                </button>
                <button
                  id="signup-create-btn"
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3 rounded-xl bg-[hsl(152,60%,28%)] hover:bg-[hsl(152,60%,22%)] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating workspace…
                    </span>
                  ) : (
                    'Create workspace →'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 2: Done ── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-[hsl(220,13%,87%)] shadow-sm p-8 text-center">
            {/* Animated checkmark */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-10 h-10 text-emerald-600">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" style={{ animationDuration: '1.5s' }} />
            </div>

            <h2 className="text-2xl font-extrabold text-[hsl(222,47%,11%)] mb-2">You&apos;re all set! 🎉</h2>
            <p className="text-sm text-[hsl(220,9%,46%)] leading-relaxed mb-2">
              Welcome to PineZone, <span className="font-semibold text-[hsl(222,47%,11%)]">{name}</span>!
            </p>
            <p className="text-sm text-[hsl(220,9%,46%)] leading-relaxed mb-8">
              Your workspace <span className="font-semibold text-emerald-700">{orgName}</span> is ready. Let&apos;s start managing your travel business.
            </p>

            {/* Perks */}
            <div className="bg-[hsl(220,14%,96%)] rounded-xl p-4 mb-8 text-left flex flex-col gap-2.5">
              {[
                '14-day free trial — no credit card required',
                'Import guests & bookings via CSV',
                'Invite your team members',
              ].map(item => (
                <div key={item} className="flex items-center gap-2.5 text-sm">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-emerald-600">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[hsl(222,47%,11%)]">{item}</span>
                </div>
              ))}
            </div>

            <button
              id="signup-dashboard-btn"
              onClick={() => router.push(inviteToken ? `/b2b/accept-invite?token=${inviteToken}` : '/dashboard')}
              className="w-full py-3.5 rounded-xl bg-[hsl(152,60%,28%)] hover:bg-[hsl(152,60%,22%)] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg"
            >
              Go to my dashboard →
            </button>
          </div>
        )}

        {/* Footer */}
        {step < 2 && (
          <p className="text-center text-xs text-[hsl(220,9%,60%)] mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-emerald-700 font-semibold hover:text-emerald-800 transition-colors">Sign in</a>
          </p>
        )}

      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[hsl(220,14%,96%)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Loading signup...</p>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
