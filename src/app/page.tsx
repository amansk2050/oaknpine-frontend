'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleSignIn = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">O</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">OakNpine Tourism</h1>
            </div>
            <button
              onClick={handleSignIn}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Welcome to <span className="text-primary">OakNpine Tourism</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Your comprehensive CRM solution for managing guests and homestays across the beautiful landscapes of North Bengal. 
            Streamline your tourism operations with our professional management platform.
          </p>
          <button
            onClick={handleSignIn}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Access Your Dashboard
          </button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Guest Management</h3>
            <p className="text-muted-foreground leading-relaxed">
              Efficiently manage your guests with comprehensive profiles, booking history, preferences, and communication tracking. 
              Deliver personalized experiences that keep guests coming back to North Bengal.
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Homestay Operations</h3>
            <p className="text-muted-foreground leading-relaxed">
              Streamline your homestay operations across North Bengal with inventory management, booking coordination, 
              maintenance scheduling, and performance analytics to maximize your business potential.
            </p>
          </div>
        </div>

        {/* Coverage Area */}
        <div className="bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
          <h3 className="text-2xl font-bold text-foreground mb-4">Serving All of North Bengal</h3>
          <p className="text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            From the tea gardens of Darjeeling to the forests of Dooars, from the hills of Kalimpong to the plains of Jalpaiguri - 
            we help you manage your tourism operations across the entire North Bengal region with local expertise and modern technology.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {['Darjeeling', 'Kalimpong', 'Kurseong', 'Mirik', 'Dooars', 'Jalpaiguri', 'Siliguri', 'Gangtok'].map((place) => (
              <span key={place} className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                {place}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            © 2024 OakNpine Tourism. Professional CRM for North Bengal&apos;s hospitality industry.
          </p>
        </div>
      </footer>
    </div>
  )
}
