'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export const ACCENT_COLORS = [
  { hex: '#00d4ff', glow: 'rgba(0,212,255,0.15)', halo: 'rgba(0,212,255,0.4)' },   // cyan
  { hex: '#00ffc2', glow: 'rgba(0,255,194,0.15)', halo: 'rgba(0,255,194,0.4)' },   // vert
  { hex: '#ff0077', glow: 'rgba(255,0,119,0.15)', halo: 'rgba(255,0,119,0.4)'  },  // rose
]

export const ACCENT_COLORS_LIGHT = [
  { hex: '#0077A8', glow: 'rgba(0,119,168,0.12)', halo: 'rgba(0,119,168,0.28)' },  // bleu-cyan foncé
  { hex: '#007A5C', glow: 'rgba(0,122,92,0.12)',  halo: 'rgba(0,122,92,0.28)'  },  // vert émeraude
  { hex: '#C4005A', glow: 'rgba(196,0,90,0.12)',  halo: 'rgba(196,0,90,0.28)'  },  // framboise
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
    '--color-bg-dark':   '#D9D5C8',
    '--color-bg-light':  '#E4E0D4',
    '--color-foreground':'#111116',
    '--color-border':    '#B8B4A8',
    '--color-muted':     '#6E6B62',
    '--background':      '#D9D5C8',
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
    const palette = theme === 'light' ? ACCENT_COLORS_LIGHT : ACCENT_COLORS
    const { hex, glow, halo } = palette[colorIndex]
    document.documentElement.style.setProperty('--color-accent', hex)
    document.documentElement.style.setProperty('--color-accent-glow', glow)
    document.documentElement.style.setProperty('--color-accent-halo', halo)
  }, [colorIndex, theme])

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
