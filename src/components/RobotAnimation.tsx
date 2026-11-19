'use client'

import { useEffect, useRef, useState } from 'react'
import { useAccentColor, ACCENT_COLORS, ACCENT_COLORS_LIGHT } from '@/context/ColorContext'

function toRGB(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}
const COLORS_DARK:  [number, number, number][] = ACCENT_COLORS.map(({ hex }) => toRGB(hex))
const COLORS_LIGHT: [number, number, number][] = ACCENT_COLORS_LIGHT.map(({ hex }) => toRGB(hex))

/**
 * Tête de robot en trame de pixels. S'adapte à la largeur disponible (max `maxSize`),
 * réagit à la souris comme au doigt (Pointer Events) et se pilote au clavier (bouton natif).
 */
export default function RobotAnimation({ maxSize = 440 }: { maxSize?: number }) {
  const wrapperRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(0)
  const { colorIndex, cycleColor, theme } = useAccentColor()
  const colorIndexRef = useRef(colorIndex)
  const themeRef = useRef(theme)

  useEffect(() => { colorIndexRef.current = colorIndex }, [colorIndex])
  useEffect(() => { themeRef.current = theme }, [theme])

  // Mesure la largeur réellement disponible (arrondie au pas de la trame)
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const measure = () => {
      const w = Math.min(maxSize, wrapper.clientWidth)
      setSize(Math.max(100, Math.floor(w / 10) * 10))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [maxSize])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !size) return

    let cancelled = false
    let p5Instance: any
    let visibility: IntersectionObserver | undefined

    import('p5').then(({ default: p5 }) => {
      if (cancelled) return

      const sketch = (p: any) => {
        let buffer: any
        const pas = 10
        let angle = 0
        const scale = size / 440
        const repulsionDistance = 300 * scale
        const repulsionStrength = 60 * scale
        // Position du pointeur (souris ou doigt) relative au canvas, null = hors du canvas
        let pointer: { x: number; y: number } | null = null
        const cellOffsets: Record<string, { x: number; y: number }> = {}
        let rotX = 0
        let rotY = 0
        // Mouvement réduit : pas de rotation automatique ni de zoom d'entrée ;
        // le robot reste interactif (il suit et repousse le pointeur).
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const autoRotateSpeed = reduceMotion ? 0 : 0.015
        let debutAnim: number
        const dureeAnim = reduceMotion ? 0 : 1300
        // Couleur affichée, interpolée vers la cible (~0.4s) pour basculer avec le reste de la page
        let shownColor: [number, number, number] | null = null

        // Unité de base pour les proportions de la tête
        const s = size * 0.42

        // Dessine la tête du robot dans le buffer WEBGL
        function drawRobotHead() {
          const hw = s           // largeur tête
          const hh = s * 0.88   // hauteur tête
          const hd = s * 0.72   // profondeur tête
          const frontZ = hd / 2 // z de la face avant

          // --- Tête principale ---
          buffer.push()
          buffer.fill(162, 165, 170)
          buffer.box(hw, hh, hd)
          buffer.pop()

          // --- Panneaux latéraux (oreilles) ---
          for (const side of [-1, 1]) {
            buffer.push()
            buffer.translate(side * (hw / 2 + s * 0.07), 0, 0)
            buffer.fill(140, 143, 148)
            buffer.box(s * 0.14, hh * 0.62, hd * 0.72)
            buffer.pop()
          }

          // --- Yeux ---
          const eyeX  = s * 0.27
          const eyeY  = -hh * 0.1
          const eyeOR = s * 0.165
          const eyeIR = s * 0.13
          const eyeDepth = s * 0.08

          for (const side of [-1, 1]) {
            buffer.push()
            buffer.translate(side * eyeX, eyeY, frontZ + eyeDepth * 0.25)
            buffer.rotateX(Math.PI / 2)
            buffer.fill(80, 82, 86)
            buffer.cylinder(eyeOR, eyeDepth * 0.6, 32)
            buffer.pop()

            buffer.push()
            buffer.translate(side * eyeX, eyeY, frontZ + eyeDepth * 0.55)
            buffer.rotateX(Math.PI / 2)
            buffer.fill(10, 10, 10)
            buffer.cylinder(eyeIR, eyeDepth, 32)
            buffer.pop()
          }

          // --- Nez ---
          buffer.push()
          buffer.translate(0, hh * 0.1, frontZ + s * 0.02)
          buffer.fill(100, 103, 107)
          buffer.box(s * 0.12, s * 0.06, s * 0.04)
          buffer.pop()

          // --- Bouche (grille de lamelles) ---
          const mouthY = hh * 0.3
          const mouthW = s * 0.56
          const mouthH = s * 0.085
          const mouthZ = frontZ + 1

          buffer.push()
          buffer.translate(0, mouthY, mouthZ)
          buffer.fill(15, 15, 15)
          buffer.box(mouthW, mouthH, s * 0.025)
          buffer.pop()

          const slats = 5
          for (let i = 0; i < slats; i++) {
            const x = -mouthW / 2 + (mouthW / (slats - 1)) * i
            buffer.push()
            buffer.translate(x, mouthY, mouthZ + s * 0.012)
            buffer.fill(35, 35, 35)
            buffer.box(s * 0.018, mouthH * 0.9, s * 0.01)
            buffer.pop()
          }

          // --- Antennes ---
          const antX    = s * 0.23
          const antTopY = -hh / 2
          const poleH   = s * 0.34
          const poleR   = s * 0.025
          const ballR   = s * 0.068

          for (const side of [-1, 1]) {
            buffer.push()
            buffer.translate(side * antX, antTopY - poleH / 2, 0)
            buffer.fill(130, 133, 138)
            buffer.cylinder(poleR, poleH, 8)
            buffer.pop()

            buffer.push()
            buffer.translate(side * antX, antTopY - poleH - ballR * 0.8, 0)
            buffer.fill(40, 8, 8)
            buffer.sphere(ballR, 12)
            buffer.pop()
          }
        }

        p.setup = () => {
          const canvas = p.createCanvas(size, size)
          canvas.parent(container)
          p.pixelDensity(1)
          p.colorMode(p.HSB, 360, 100, 100)
          buffer = p.createGraphics(size, size, p.WEBGL)
          debutAnim = p.millis()

          // Pointer Events : souris, stylet et doigt. La répulsion démarre dès l'appui.
          const el: HTMLCanvasElement = canvas.elt
          const track = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
          }
          const release = (e: PointerEvent) => {
            // Au doigt, le pointeur « disparaît » au relâchement ; à la souris il reste survolé
            if (e.type !== 'pointerup' || e.pointerType !== 'mouse') pointer = null
          }
          el.addEventListener('pointerenter', track)
          el.addEventListener('pointerdown', track)
          el.addEventListener('pointermove', track)
          el.addEventListener('pointerup', release)
          el.addEventListener('pointerleave', release)
          el.addEventListener('pointercancel', release)
        }

        p.draw = () => {
          const now    = p.millis()
          const t      = dureeAnim ? p.constrain((now - debutAnim) / dureeAnim, 0, 1) : 1
          const easedT = 1 - p.pow(1 - t, 3)

          const cibleX = p.map(p.mouseY, 0, size, -p.PI / 5, p.PI / 5, true)
          const cibleY = p.map(p.mouseX, 0, size, -p.PI / 5, p.PI / 5, true)
          rotX = p.lerp(rotX, cibleX + angle * 0.3, 0.06)
          rotY = p.lerp(rotY, cibleY + angle, 0.06)

          buffer.push()
          buffer.background(255)
          buffer.ambientLight(85)
          buffer.directionalLight(255, 255, 255, 0.5,  0.5, -1)
          buffer.directionalLight(70,  70,  75, -0.4,  0.1,  0.6)
          buffer.noStroke()
          buffer.rotateX(rotX)
          buffer.rotateY(rotY)
          buffer.scale(easedT)
          drawRobotHead()
          buffer.pop()

          buffer.loadPixels()

          const palette = themeRef.current === 'light' ? COLORS_LIGHT : COLORS_DARK
          const target = palette[colorIndexRef.current]
          if (!shownColor || reduceMotion) shownColor = [...target]
          else for (let c = 0; c < 3; c++) shownColor[c] += (target[c] - shownColor[c]) * 0.12
          p.clear()
          p.noStroke()
          p.colorMode(p.RGB)
          p.fill(shownColor[0], shownColor[1], shownColor[2])

          for (let y = 0; y < size; y += pas) {
            for (let x = 0; x < size; x += pas) {
              const i = 4 * (y * size + x)
              const gris    = (buffer.pixels[i] + buffer.pixels[i + 1] + buffer.pixels[i + 2]) / 3
              const grisMap = p.map(gris, 80, 220, 0, 255, true)
              const largeur = p.map(grisMap, 0, 255, pas, 0)
              const offsetX = (pas - largeur) / 2

              let targetRepulseX = 0
              let targetRepulseY = 0

              if (pointer) {
                const dx       = (x + pas / 2) - pointer.x
                const dy       = (y + pas / 2) - pointer.y
                const distance = p.sqrt(dx * dx + dy * dy)
                if (distance < repulsionDistance && distance > 0) {
                  const force        = p.map(distance, 0, repulsionDistance, repulsionStrength, 0)
                  const repulseAngle = p.atan2(dy, dx)
                  targetRepulseX     = p.cos(repulseAngle) * force
                  targetRepulseY     = p.sin(repulseAngle) * force
                }
              }

              const cellKey = `${x}_${y}`
              if (!cellOffsets[cellKey]) cellOffsets[cellKey] = { x: 0, y: 0 }
              cellOffsets[cellKey].x += (targetRepulseX - cellOffsets[cellKey].x) * 0.15
              cellOffsets[cellKey].y += (targetRepulseY - cellOffsets[cellKey].y) * 0.15

              p.rect(
                x + offsetX + cellOffsets[cellKey].x,
                y + cellOffsets[cellKey].y,
                largeur,
                pas
              )
            }
          }

          angle += autoRotateSpeed
        }
      }

      p5Instance = new p5(sketch)

      // Hors écran : on arrête la boucle de rendu (batterie, CPU)
      visibility = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) p5Instance.loop()
        else p5Instance.noLoop()
      })
      visibility.observe(container)
    })

    return () => {
      cancelled = true
      visibility?.disconnect()
      p5Instance?.remove()
    }
  }, [size])

  return (
    <button
      ref={wrapperRef}
      type="button"
      onClick={cycleColor}
      aria-label="Changer la couleur d'accent"
      className="block w-full cursor-pointer select-none [-webkit-tap-highlight-color:transparent] transition-transform duration-100 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent"
      style={{ maxWidth: maxSize, aspectRatio: '1 / 1' }}
    >
      <div
        ref={containerRef}
        aria-hidden="true"
        className="mx-auto"
        style={{ width: size || '100%', height: size || '100%', lineHeight: 0 }}
      />
    </button>
  )
}
