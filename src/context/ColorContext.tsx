'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export const ACCENT_COLORS = [
  { hex: '#00d4ff', glow: 'rgba(0,212,255,0.15)', halo: 'rgba(0,212,255,0.4)' },   // cyan
  { hex: '#00ffc2', glow: 'rgba(0,255,194,0.15)', halo: 'rgba(0,255,194,0.4)' },   // vert
  { hex: '#ff0077', glow: 'rgba(255,0,119,0.15)', halo: 'rgba(255,0,119,0.4)'  },  // rose
]

const THEMES = {
  dark: {
    '--color-bg-dark':   '#111116',
    '--color-bg-light':  '#18181f',
    '--color-foreground':'#f0f0f0',
    '--color-border':    '#1e1e1e',
    '--color-muted':     '#606060',
    '--background':      '#111116',
    '--foreground':      '#f0f0f0',
  },
  light: {
    '--color-bg-dark':   '#f4f0e6',
    '--color-bg-light':  '#ece6d8',
    '--color-foreground':'#111116',
    '--color-border':    '#cec8b8',
    '--color-muted':     '#888880',
    '--background':      '#f4f0e6',
    '--foreground':      '#111116',
  },
}

type ColorContextType = {
  colorIndex: number
  cycleColor: () => void
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

const ColorContext = createContext<ColorContextType>({
  colorIndex: 0,
  cycleColor: () => {},
  theme: 'dark',
  toggleTheme: () => {},
})

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colorIndex, setColorIndex] = useState(0)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const vars = THEMES[theme]
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
  }, [theme])

  useEffect(() => {
    const { hex, glow, halo } = ACCENT_COLORS[colorIndex]
    document.documentElement.style.setProperty('--color-accent', hex)
    document.documentElement.style.setProperty('--color-accent-glow', glow)
    document.documentElement.style.setProperty('--color-accent-halo', halo)
  }, [colorIndex])

  function cycleColor() {
    setColorIndex((i) => (i + 1) % ACCENT_COLORS.length)
  }

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ColorContext.Provider value={{ colorIndex, cycleColor, theme, toggleTheme }}>
      {children}
    </ColorContext.Provider>
  )
}

export function useAccentColor() {
  return useContext(ColorContext)
}
