import SectionHeader from './SectionHeader'

const stack = [
  'Next.js',
  'React',
  'Flutter',
  'Node.js',
  'PHP',
  'Symfony',
  'REST API',
  'MariaDB',
  'Git',
  'Docker',
  'LLM',
  'Claude',
  'Cursor',
]

export default function StackSection() {
  return (
    <section id="stack" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader index="06" title="Stack technique" />

        <ul className="flex flex-wrap gap-3" aria-label="Technologies utilisées">
          {stack.map((tech) => (
            <li
              key={tech}
              className="group flex items-center gap-3 border border-border bg-bg-light px-5 py-3 hover:border-accent/60 transition-colors duration-200"
            >
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 bg-accent/50 group-hover:bg-accent transition-colors duration-200 shrink-0"
              />
              <span className="font-mono text-sm text-foreground/90 group-hover:text-foreground transition-colors duration-200">
                {tech}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
