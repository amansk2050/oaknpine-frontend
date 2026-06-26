'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

/* ─── tiny inline icons ─────────────────────────────────────────────────── */
const Icon = {
  Pine: () => (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path d="M16 3L6 14h5l-5 8h7v7h6v-7h7l-5-8h5L16 3z" fill="currentColor" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M8 10h8M8 14h8M12 6v12" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 inline mr-2 text-emerald-500">
      <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 inline ml-1">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-400">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
}

/* ─── data ───────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Icon.Users,
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    title: 'Guest CRM',
    desc: 'Comprehensive guest profiles with booking history, preferences, and communication logs. Deliver personalized experiences at scale.',
  },
  {
    icon: Icon.Calendar,
    color: 'from-sky-500 to-indigo-600',
    bg: 'bg-sky-50',
    title: 'Room Booking',
    desc: 'Real-time availability calendar, instant confirmations, and automated messaging keep your rooms full and guests happy.',
  },
  {
    icon: Icon.Package,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    title: 'Package Builder',
    desc: 'Craft bespoke travel packages — bundles of rooms, activities, and transfers — with dynamic pricing and profit margins.',
  },
  {
    icon: Icon.TrendingUp,
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    title: 'Lead Tracking',
    desc: 'Never lose a prospect. Track inquiries from first touch to confirmed booking with automated follow-up reminders.',
  },
  {
    icon: Icon.BarChart,
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    title: 'Revenue Analytics',
    desc: 'Live dashboards with occupancy rates, ADR, RevPAR, and forecast reports to drive smarter decisions.',
  },
  {
    icon: Icon.Building,
    color: 'from-cyan-500 to-sky-600',
    bg: 'bg-cyan-50',
    title: 'Multi-property',
    desc: 'Manage unlimited homestays and properties under one account. Switch workspaces instantly without re-logging.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Create your workspace',
    desc: 'Sign up and create your travel agency workspace in under 2 minutes. Invite your team right away.',
  },
  {
    step: '02',
    title: 'Add your properties',
    desc: 'Onboard your homestays, rooms, and tour packages. Import existing guest data via CSV.',
  },
  {
    step: '03',
    title: 'Grow with confidence',
    desc: 'Take bookings, manage leads, and use analytics to scale your agency across any region.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Owner, Darjeeling Hills Retreat',
    avatar: 'PS',
    text: 'PineZone transformed how we manage our 12 cottages. Bookings are up 40% and guest satisfaction scores have never been better.',
    rating: 5,
  },
  {
    name: 'Rohit Banerjee',
    role: 'Director, Dooars Nature Camps',
    avatar: 'RB',
    text: 'Switching from spreadsheets to PineZone saved us hours every day. The package builder alone paid for the subscription in the first week.',
    rating: 5,
  },
  {
    name: 'Anjali Das',
    role: 'Manager, Silk Route Homestays',
    avatar: 'AD',
    text: 'The lead tracking and follow-up reminders means we never miss an inquiry. Our conversion rate jumped from 22% to 61% in 3 months.',
    rating: 5,
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: '₹999',
    period: '/mo',
    desc: 'Perfect for solo operators & small homestays.',
    highlight: false,
    features: ['Up to 5 rooms', '100 guest records', '2 team members', 'Booking calendar', 'Basic analytics', 'Email support'],
  },
  {
    name: 'Growth',
    price: '₹2,999',
    period: '/mo',
    desc: 'Built for growing agencies and multi-property operators.',
    highlight: true,
    features: ['Unlimited rooms', '10,000 guest records', '10 team members', 'Package builder', 'Lead tracking', 'Advanced analytics', 'Priority support', 'Custom branding'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large agencies, chains, and group operators.',
    highlight: false,
    features: ['Everything in Growth', 'Unlimited team members', 'Multi-workspace SSO', 'Dedicated account manager', 'SLA guarantee', 'API access', 'White-label option'],
  },
]

const DESTINATIONS = ['Darjeeling', 'Kalimpong', 'Kurseong', 'Mirik', 'Dooars', 'Jalpaiguri', 'Sikkim', 'Gangtok', 'Pelling', 'Ravangla']

/* ─── stat counter ───────────────────────────────────────────────────────── */
function StatCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const duration = 1800
        const steps = 60
        const increment = target / steps
        let current = 0
        const timer = setInterval(() => {
          current += increment
          if (current >= target) {
            setCount(target)
            clearInterval(timer)
          } else {
            setCount(Math.floor(current))
          }
        }, duration / steps)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ─── scroll reveal hook ─────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ─── main component ─────────────────────────────────────────────────────── */
export default function Home() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useReveal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[hsl(220,25%,97%)] text-[hsl(222,47%,11%)] overflow-x-hidden" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg shadow-black/5' : 'bg-transparent'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 text-emerald-700">
              <Icon.Pine />
            </div>
            <span className="text-xl font-800 tracking-tight" style={{ fontWeight: 800 }}>
              <span className="text-gradient-pine">Pine</span>
              <span className="text-[hsl(222,47%,11%)]">Zone</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Pricing', 'About'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-medium text-[hsl(220,9%,46%)] hover:text-[hsl(152,60%,28%)] transition-colors duration-200">
                {item}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              id="nav-login-btn"
              onClick={() => router.push('/login')}
              className="text-sm font-semibold text-[hsl(222,47%,11%)] hover:text-[hsl(152,60%,28%)] transition-colors px-4 py-2">
              Sign in
            </button>
            <button
              id="nav-signup-btn"
              onClick={() => router.push('/signup')}
              className="text-sm font-semibold bg-[hsl(152,60%,28%)] hover:bg-[hsl(152,60%,22%)] text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-px">
              Start free trial
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 text-[hsl(222,47%,11%)]"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <Icon.X /> : <Icon.Menu />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden glass border-t border-white/30 px-4 py-4 flex flex-col gap-4">
            {['Features', 'How it Works', 'Pricing', 'About'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-[hsl(220,9%,46%)] hover:text-[hsl(152,60%,28%)] transition-colors">
                {item}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-[hsl(220,13%,87%)]">
              <button onClick={() => router.push('/login')} className="text-sm font-semibold text-center py-2.5 border border-[hsl(220,13%,87%)] rounded-xl hover:bg-[hsl(220,14%,93%)] transition-colors">Sign in</button>
              <button onClick={() => router.push('/signup')} className="text-sm font-semibold text-center py-2.5 bg-[hsl(152,60%,28%)] text-white rounded-xl hover:bg-[hsl(152,60%,22%)] transition-colors">Start free trial</button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden bg-grid-navy\/4">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-300/20 animate-blob blur-3xl pointer-events-none" />
        <div className="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-amber-200/30 to-emerald-200/20 animate-blob blur-3xl pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Now with AI-powered booking predictions
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 animate-fade-up delay-100">
            The CRM that{' '}
            <br className="hidden sm:block" />
            <span className="text-gradient-pine">travel agencies</span>
            <br />
            actually love.
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-[hsl(220,9%,46%)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
            PineZone is a multi-tenant SaaS platform for travel agencies and homestay operators — manage guests, rooms, packages, and leads from one beautiful workspace.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <button
              id="hero-start-btn"
              onClick={() => router.push('/signup')}
              className="group relative inline-flex items-center gap-2 bg-[hsl(152,60%,28%)] hover:bg-[hsl(152,60%,22%)] text-white font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden animate-glow-pulse">
              <span className="relative z-10">Start free trial — no card needed</span>
              <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-200">
                <Icon.ArrowRight />
              </span>
              {/* shimmer effect */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
            </button>
            <button
              id="hero-demo-btn"
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-2 bg-white border border-[hsl(220,13%,87%)] hover:border-[hsl(152,60%,28%)] hover:text-[hsl(152,60%,28%)] text-[hsl(222,47%,11%)] font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-sm hover:shadow-md">
              View live demo
            </button>
          </div>

          {/* Floating destination tags */}
          <div className="mt-16 flex flex-wrap justify-center gap-2.5 animate-fade-up delay-500">
            {DESTINATIONS.map((d, i) => (
              <span
                key={d}
                style={{ animationDelay: `${i * 150}ms` }}
                className="inline-flex items-center gap-1.5 bg-white border border-[hsl(220,13%,87%)] text-[hsl(220,9%,46%)] text-xs font-medium px-3.5 py-1.5 rounded-full shadow-sm animate-float hover:border-emerald-300 hover:text-emerald-700 transition-colors cursor-default"
              >
                <span className="w-3.5 h-3.5 text-emerald-500"><Icon.MapPin /></span>
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(220,25%,97%)] to-transparent pointer-events-none" />
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-[hsl(222,47%,11%)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
          {[
            { value: 1200, suffix: '+', label: 'Travel agencies onboarded' },
            { value: 50000, suffix: '+', label: 'Bookings managed monthly' },
            { value: 99, suffix: '.9%', label: 'Uptime SLA guaranteed' },
          ].map((stat) => (
            <div key={stat.label} className="reveal">
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                <StatCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-white/60 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Everything you need</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Built for travel, <span className="text-gradient-pine">not spreadsheets.</span></h2>
          <p className="text-[hsl(220,9%,46%)] text-lg max-w-2xl mx-auto">From first inquiry to check-out — every workflow your agency needs is here, deeply integrated, and beautifully designed.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{ animationDelay: `${i * 80}ms` }}
              className="reveal group bg-white rounded-2xl p-7 border border-[hsl(220,13%,87%)] hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <div className={`w-6 h-6 bg-gradient-to-br ${f.color} rounded-md p-1 text-white`}>
                  <f.icon />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-[hsl(220,9%,46%)] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-[hsl(222,47%,11%)] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">Simple onboarding</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Up and running <span className="text-gradient-pine">in minutes.</span></h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">No complex setup. No IT team required. Just sign up, add your properties, and start taking bookings.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.step} style={{ animationDelay: `${i * 150}ms` }} className="reveal relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-emerald-500/40 z-10" />
                )}
                <span className="text-5xl font-extrabold text-emerald-500/30 select-none">{s.step}</span>
                <h3 className="text-lg font-bold mt-3 mb-2">{s.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MULTITENANCY CALLOUT ─────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="reveal bg-gradient-to-br from-emerald-700 via-emerald-800 to-[hsl(222,47%,16%)] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
            {/* decorative */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full mb-5">
                  <Icon.Shield />
                  Multi-tenant by design
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">One platform. Multiple agencies. Complete isolation.</h2>
                <p className="text-white/70 leading-relaxed mb-6">Each workspace is fully isolated — data, users, and settings. Franchise operators, DMC groups, and agency networks can run multiple brands under one account.</p>
                <button
                  id="multitenant-cta-btn"
                  onClick={() => router.push('/signup')}
                  className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg">
                  Create your workspace <Icon.ArrowRight />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Isolated data per workspace',
                  'Role-based access (Owner / Admin / Member)',
                  'Switch workspaces instantly',
                  'Per-workspace billing and limits',
                  'Custom branding per organization',
                  'SSO support for Enterprise',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 text-sm font-medium">
                    <Icon.CheckCircle />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="py-24 bg-[hsl(220,14%,93%)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 reveal">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Loved by agencies</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Real results, <span className="text-gradient-pine">real agencies.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} style={{ animationDelay: `${i * 120}ms` }} className="reveal bg-white rounded-2xl p-7 border border-[hsl(220,13%,87%)] shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.rating }).map((_, k) => <Icon.Star key={k} />)}
                </div>
                <p className="text-[hsl(222,47%,11%)] leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-[hsl(220,9%,46%)]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Simple pricing</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Pay for what you <span className="text-gradient-pine">actually use.</span></h2>
            <p className="text-[hsl(220,9%,46%)] text-lg max-w-xl mx-auto">All plans include a 14-day free trial. No credit card required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                style={{ animationDelay: `${i * 100}ms` }}
                className={`reveal relative rounded-2xl p-8 flex flex-col border transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlight
                    ? 'bg-[hsl(222,47%,11%)] border-emerald-500 shadow-2xl text-white scale-[1.03]'
                    : 'bg-white border-[hsl(220,13%,87%)] hover:border-emerald-200 hover:shadow-xl'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-[hsl(222,47%,11%)] text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : ''}`}>{plan.name}</h3>
                  <p className={`text-sm mb-4 ${plan.highlight ? 'text-white/60' : 'text-[hsl(220,9%,46%)]'}`}>{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-[hsl(222,47%,11%)]'}`}>{plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlight ? 'text-white/60' : 'text-[hsl(220,9%,46%)]'}`}>{plan.period}</span>
                  </div>
                </div>

                <ul className="flex-1 flex flex-col gap-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-white/80' : 'text-[hsl(222,47%,11%)]'}`}>
                      <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  id={`pricing-${plan.name.toLowerCase()}-btn`}
                  onClick={() => router.push('/signup')}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg hover:shadow-xl'
                      : 'bg-[hsl(220,14%,93%)] hover:bg-[hsl(152,60%,28%)] hover:text-white text-[hsl(222,47%,11%)]'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact sales' : 'Get started free'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center reveal">
          <div className="bg-gradient-to-br from-[hsl(152,60%,28%)] to-[hsl(152,65%,18%)] rounded-3xl px-8 py-16 sm:py-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black/10 rounded-full" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
                Ready to grow your agency?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                Join 1,200+ travel agencies using PineZone to manage bookings, grow revenue, and delight guests.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  id="final-cta-btn"
                  onClick={() => router.push('/signup')}
                  className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all duration-200 shadow-xl hover:-translate-y-1 text-base">
                  Start free — no card needed <Icon.ArrowRight />
                </button>
                <button
                  id="final-login-btn"
                  onClick={() => router.push('/login')}
                  className="text-white/80 hover:text-white font-medium text-sm transition-colors">
                  Already have an account? Sign in →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-[hsl(222,47%,7%)] text-white py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 text-emerald-400"><Icon.Pine /></div>
                <span className="text-lg font-extrabold">PineZone</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">The travel CRM built for agencies and homestay operators in North Bengal and beyond.</p>
            </div>
            {[
              { heading: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { heading: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
            ].map(col => (
              <div key={col.heading}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">{col.heading}</h4>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© {new Date().getFullYear()} PineZone. All rights reserved.</p>
            <p>Built with ❤ for North Bengal&apos;s hospitality industry.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
