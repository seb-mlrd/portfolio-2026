import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ColorProvider } from '@/context/ColorContext'
import LenisProvider from '@/components/LenisProvider'
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
      <body className="min-h-full flex flex-col bg-bg-dark text-foreground">
        <ColorProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </ColorProvider>
      </body>
    </html>
  )
}
