import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import ReactQueryProvider from '@/provider/queryClientProvider'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'PineZone — Travel CRM for Modern Agencies',
  description: 'PineZone is a multi-tenant SaaS Travel CRM built for modern travel agencies and homestay operators. Manage guests, bookings, packages, and leads — all in one place.',
  keywords: ['travel CRM', 'homestay management', 'booking software', 'travel agency software', 'North Bengal tourism'],
  openGraph: {
    title: 'PineZone — Travel CRM for Modern Agencies',
    description: 'Multi-tenant SaaS Travel CRM for travel agencies and homestay operators.',
    type: 'website',
    siteName: 'PineZone',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className={`${outfit.className} antialiased`}>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}
