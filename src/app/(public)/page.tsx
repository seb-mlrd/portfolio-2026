import HeroSection from '../_sections/HeroSection'
import AboutSection from '../_sections/AboutSection'
import ExperienceSection from '../_sections/ExperienceSection'
import ProjectsSection from '../_sections/ProjectsSection'
import EducationSection from '../_sections/EducationSection'
import SkillsSection from '../_sections/SkillsSection'
import StackSection from '../_sections/StackSection'
import ContactSection from '../_sections/ContactSection'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <EducationSection />
      <SkillsSection />
      <StackSection />
      <ContactSection />
    </main>
  )
}
