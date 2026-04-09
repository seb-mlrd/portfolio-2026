'use client'

import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useAccentColor } from '@/context/ColorContext'

const nav = [
  { href: '/admin',          label: 'Dashboard', icon: '◈' },
  { href: '/admin/messages', label: 'Messages',  icon: '◉' },
  { href: '/admin/projects', label: 'Projets',   icon: '◧' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useAccentColor()
  const isDark = theme === 'dark'

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
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {nav.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-widest uppercase transition-colors duration-200 text-left ${
                isActive
                  ? 'text-accent bg-accent/5 border-l-2 border-accent pl-[10px]'
                  : 'text-muted hover:text-foreground hover:bg-border/50 border-l-2 border-transparent pl-[10px]'
              }`}
            >
              <span className="text-[10px]">{item.icon}</span>
              {item.label}
            </button>
          )
        })}
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
