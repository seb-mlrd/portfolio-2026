'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'

// Doivent rester alignées avec les variables de globals.css ([data-theme] / [data-accent]).
export const ACCENT_COLORS = [
  { hex: '#00d4ff' }, // cyan
  { hex: '#00ffc2' }, // vert
  { hex: '#ff0077' }, // rose
]

// Assombries pour tenir le contraste AA (≥ 4.5:1) sur les fonds du thème clair.
export const ACCENT_COLORS_LIGHT = [
  { hex: '#006088' }, // bleu-cyan
  { hex: '#00684E' }, // vert émeraude
  { hex: '#B40053' }, // framboise
]

type Theme = 'dark' | 'light'

type ColorContextType = {
  colorIndex: number
  cycleColor: () => void
  theme: Theme
  toggleTheme: () => void
}

const ColorContext = createContext<ColorContextType>({
  colorIndex: 0,
  cycleColor: () => {},
  theme: 'dark',
  toggleTheme: () => {},
})

const store = {
  get(key: string) {
    try { return localStorage.getItem(key) } catch { return null }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value) } catch {}
  },
}

/**
 * Script inline exécuté avant le premier rendu : pose data-theme / data-accent sur <html>
 * pour éviter un flash du mauvais thème. Préférence enregistrée > préférence système.
 */
export const themeInitScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.theme=t;var a=localStorage.getItem('accent');if(a==='1'||a==='2')d.dataset.accent=a}catch(e){}})()`

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colorIndex, setColorIndex] = useState(0)
  const [theme, setTheme] = useState<Theme>('dark')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Le DOM a déjà été configuré par themeInitScript : on aligne l'état React dessus.
  useEffect(() => {
    const root = document.documentElement
    /* eslint-disable react-hooks/set-state-in-effect -- synchro unique avec le DOM pré-hydratation */
    if (root.dataset.theme === 'light') setTheme('light')
    const accent = Number(root.dataset.accent ?? 0)
    if (accent) setColorIndex(accent)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  // Toutes les couleurs (fonds, textes, bordures) basculent ensemble, sur la même durée.
  function withTransition(apply: () => void) {
    const root = document.documentElement
    root.classList.add('theme-transition')
    apply()
    clearTimeout(timer.current)
    timer.current = setTimeout(() => root.classList.remove('theme-transition'), 450)
  }

  function cycleColor() {
    const next = (colorIndex + 1) % ACCENT_COLORS.length
    withTransition(() => {
      document.documentElement.dataset.accent = String(next)
    })
    store.set('accent', String(next))
    setColorIndex(next)
  }

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    withTransition(() => {
      document.documentElement.dataset.theme = next
    })
    store.set('theme', next)
    setTheme(next)
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
