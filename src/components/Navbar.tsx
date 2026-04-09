'use client'

import { useState, useEffect } from 'react'

const links = [
  { label: 'Présentation', href: '#presentation' },
  { label: 'Projets', href: '#projets' },
  { label: 'Compétences', href: '#competences' },
  { label: 'Contact', href: '#contact' },
]

function scrollToSection(href: string) {
  const id = href.replace('#', '')
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')

  // Blur on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Active section via IntersectionObserver
  useEffect(() => {
    const sectionIds = links.map((l) => l.href.replace('#', ''))
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        // Section becomes active when its top crosses the 25%-70% viewport band
        { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  function handleLinkClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault()
    setIsOpen(false)
    scrollToSection(href)
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#080808]/90 backdrop-blur-md border-b border-[#1e1e1e]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => handleLinkClick(e, '#hero')}
          className="font-mono text-lg font-bold tracking-[0.3em] text-accent transition-all duration-300 hover:tracking-[0.5em]"
          style={{ textShadow: '0 0 20px var(--color-accent-halo)' }}
        >
          S.M<span className="animate-[blink_1.1s_step-end_infinite]">_</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-10">
          {links.map((link) => {
            const id = link.href.replace('#', '')
            const isActive = activeSection === id
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`group relative font-mono text-[11px] uppercase tracking-[0.25em] transition-colors duration-300 ${
                    isActive ? 'text-accent' : 'text-muted hover:text-accent'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </a>
              </li>
            )
          })}
        </ul>

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] text-[#f0f0f0]"
          aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <span
            className={`block h-px bg-current transition-all duration-300 origin-center ${
              isOpen ? 'w-6 rotate-45 translate-y-[7px]' : 'w-6'
            }`}
          />
          <span
            className={`block h-px bg-current transition-all duration-200 ${
              isOpen ? 'w-0 opacity-0' : 'w-4'
            }`}
          />
          <span
            className={`block h-px bg-current transition-all duration-300 origin-center ${
              isOpen ? 'w-6 -rotate-45 -translate-y-[7px]' : 'w-6'
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="px-6 py-6 flex flex-col gap-5 border-t border-[#1e1e1e] bg-[#080808]/95 backdrop-blur-md">
          {links.map((link, i) => {
            const id = link.href.replace('#', '')
            const isActive = activeSection === id
            return (
              <li
                key={link.href}
                style={{ transitionDelay: isOpen ? `${i * 60}ms` : '0ms' }}
                className={`transition-all duration-300 ${
                  isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
              >
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`font-mono text-sm uppercase tracking-[0.25em] transition-colors duration-200 block ${
                    isActive ? 'text-accent' : 'text-muted hover:text-accent'
                  }`}
                >
                  <span className="text-accent mr-3 text-xs">0{i + 1}.</span>
                  {link.label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </header>
  )
}
