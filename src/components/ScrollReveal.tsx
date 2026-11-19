'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Fait apparaître les éléments `[data-reveal]` quand ils entrent dans l'écran.
 * Le masquage initial n'est appliqué que si ce script tourne (classe `reveal-ready` sur <html>),
 * donc sans JS ou en mouvement réduit tout reste visible.
 */
export default function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    root.classList.add('reveal-ready')

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )

    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [pathname])

  return null
}
