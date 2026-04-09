import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ColorProvider } from '@/context/ColorContext'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'S.M — Développeur Full Stack',
  description: 'Portfolio de S.M, développeur full stack spécialisé en Next.js, TypeScript et PostgreSQL.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080808] text-[#f0f0f0]">
        <ColorProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </ColorProvider>
      </body>
    </html>
  )
}
