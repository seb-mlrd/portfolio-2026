'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export const ACCENT_COLORS = [
  { hex: '#00d4ff', glow: 'rgba(0,212,255,0.15)', halo: 'rgba(0,212,255,0.4)' },   // cyan
  { hex: '#00ffc2', glow: 'rgba(0,255,194,0.15)', halo: 'rgba(0,255,194,0.4)' },   // vert
  { hex: '#ff0077', glow: 'rgba(255,0,119,0.15)', halo: 'rgba(255,0,119,0.4)'  },  // rose
]

type ColorContextType = {
  colorIndex: number
  cycleColor: () => void
}

const ColorContext = createContext<ColorContextType>({
  colorIndex: 0,
  cycleColor: () => {},
})

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colorIndex, setColorIndex] = useState(0)

  useEffect(() => {
    const { hex, glow, halo } = ACCENT_COLORS[colorIndex]
    document.documentElement.style.setProperty('--color-accent', hex)
    document.documentElement.style.setProperty('--color-accent-glow', glow)
    document.documentElement.style.setProperty('--color-accent-halo', halo)
  }, [colorIndex])

  function cycleColor() {
    setColorIndex((i) => (i + 1) % ACCENT_COLORS.length)
  }

  return (
    <ColorContext.Provider value={{ colorIndex, cycleColor }}>
      {children}
    </ColorContext.Provider>
  )
}

export function useAccentColor() {
  return useContext(ColorContext)
}
