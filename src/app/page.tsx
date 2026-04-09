import HeroSection from './_sections/HeroSection'
import AboutSection from './_sections/AboutSection'
import ProjectsSection from './_sections/ProjectsSection'
import SkillsSection from './_sections/SkillsSection'
import ContactSection from './_sections/ContactSection'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </main>
  )
}
