import Link from 'next/link'
import ProjectForm from '../_components/ProjectForm'

export const metadata = { title: 'Nouveau projet — Admin' }

export default function NewProjectPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-10">
        <Link
          href="/admin/projects"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted hover:text-accent transition-colors duration-200"
        >
          ← Retour
        </Link>
        <div className="w-px h-4 bg-border" />
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Nouveau projet</h1>
        </div>
      </div>

      <ProjectForm />
    </div>
  )
}
