'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useAccentColor } from '@/context/ColorContext'

const nav = [
  { href: '/admin',          label: 'Dashboard', icon: '◈' },
  { href: '/admin/messages', label: 'Messages',  icon: '◉' },
]

const quoteNav = [
  { href: '/admin/devis',             label: 'Devis',       icon: '▣' },
  { href: '/admin/devis/clients',     label: 'Clients',     icon: '◍' },
  { href: '/admin/devis/prestations', label: 'Prestations', icon: '▥' },
  { href: '/admin/devis/reglages',    label: 'Réglages',    icon: '◎' },
]

// Regroupés dans le menu déroulant « Contenu »
const contentNav = [
  { href: '/admin/projects', label: 'Projets',   icon: '◧' },
  { href: '/admin/experiences', label: 'Expériences', icon: '◨' },
  { href: '/admin/educations',  label: 'Formation',   icon: '◩' },
  { href: '/admin/skills',      label: 'Compétences', icon: '◪' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useAccentColor()
  const isDark = theme === 'dark'

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    // « Devis » ne s'allume pas sur ses sous-sections, qui ont leur propre entrée
    if (href === '/admin/devis' && quoteNav.some((i) => i.href !== href && pathname.startsWith(i.href))) return false
    return pathname.startsWith(href)
  }
  const inContent = contentNav.some((item) => isActive(item.href))
  // Tant que l'utilisateur n'a rien choisi, le menu s'ouvre sur les pages de contenu
  const [openChoice, setOpenChoice] = useState<boolean | null>(null)
  const isOpen = openChoice ?? inContent

  const renderItem = (item: (typeof nav)[number]) => (
    <button
      key={item.href}
      onClick={() => router.push(item.href)}
      aria-current={isActive(item.href) ? 'page' : undefined}
      className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-widest uppercase transition-colors duration-200 text-left ${
        isActive(item.href)
          ? 'text-accent bg-accent/5 border-l-2 border-accent pl-[10px]'
          : 'text-muted hover:text-foreground hover:bg-border/50 border-l-2 border-transparent pl-[10px]'
      }`}
    >
      <span className="text-[10px]" aria-hidden="true">{item.icon}</span>
      {item.label}
    </button>
  )

  return (
    <aside className="w-56 shrink-0 border-r border-border flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-border">
        <span
          className="font-mono text-base font-bold tracking-[0.3em] text-accent"
          style={{ textShadow: '0 0 15px var(--color-accent-halo)' }}
        >
          S.M_
        </span>
        <p className="font-mono text-[10px] text-muted tracking-[0.2em] uppercase mt-0.5">Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {nav.map(renderItem)}

        <p className="px-3 pt-4 pb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted/60">Facturation</p>
        {quoteNav.map(renderItem)}
        <div className="h-px bg-border my-3" />

        {/* Contenu : replié, il reste en surbrillance si la page courante en fait partie */}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="admin-content-nav"
          onClick={() => setOpenChoice(!isOpen)}
          className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-widest uppercase transition-colors duration-200 text-left border-l-2 pl-[10px] ${
            inContent && !isOpen
              ? 'text-accent bg-accent/5 border-accent'
              : `${inContent ? 'text-foreground' : 'text-muted'} hover:text-foreground hover:bg-border/50 border-transparent`
          }`}
        >
          <span className="text-[10px]" aria-hidden="true">▤</span>
          Contenu
          <svg
            className={`ml-auto w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
          >
            <path d="M3 4.5l3 3 3-3" />
          </svg>
        </button>
        <div id="admin-content-nav" hidden={!isOpen}>
          <div className="ml-4 border-l border-border flex flex-col gap-1">
            {contentNav.map(renderItem)}
          </div>
        </div>
      </nav>

      {/* Theme + Logout */}
      <div className="px-3 py-4 border-t border-border flex flex-col gap-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-widest uppercase text-muted hover:text-foreground transition-colors duration-200 text-left border-l-2 border-transparent pl-[10px]"
        >
          <span className="text-[10px]">{isDark ? '○' : '●'}</span>
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-widest uppercase text-muted hover:text-red-400 transition-colors duration-200 text-left border-l-2 border-transparent pl-[10px]"
        >
          <span className="text-[10px]">⏻</span>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
