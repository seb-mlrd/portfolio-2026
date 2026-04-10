import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata = { title: 'Dashboard — Admin' }

async function getStats() {
  const [totalProjects, publishedProjects, totalMessages, unreadMessages] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
  ])
  return { totalProjects, publishedProjects, totalMessages, unreadMessages }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const stats = await getStats()

  const cards = [
    {
      label: 'Projets',
      value: stats.totalProjects,
      sub: `${stats.publishedProjects} publiés`,
      href: '/admin/projects',
    },
    {
      label: 'Messages',
      value: stats.totalMessages,
      sub: stats.unreadMessages > 0 ? `${stats.unreadMessages} non lus` : 'Tout lu',
      href: '/admin/messages',
      alert: stats.unreadMessages > 0,
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-1">
          Bienvenue,
        </p>
        <h1 className="font-mono text-2xl font-bold tracking-tight">
          {session?.user?.name ?? 'Admin'}
        </h1>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Aperçu</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 gap-px bg-border mb-12">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="group bg-bg-dark p-7 hover:bg-bg-light transition-colors duration-200"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-3">
              {card.label}
            </p>
            <p className={`font-mono text-4xl font-bold mb-2 transition-colors duration-200 ${
              card.alert ? 'text-accent' : 'text-foreground group-hover:text-accent'
            }`}>
              {card.value}
            </p>
            <p className={`font-mono text-xs tracking-wider ${
              card.alert ? 'text-accent/70' : 'text-muted'
            }`}>
              {card.sub}
            </p>
          </a>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Accès rapide</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Voir les messages',  href: '/admin/messages' },
          { label: 'Gérer les projets',  href: '/admin/projects' },
          { label: 'Voir le portfolio',  href: '/' },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-mono text-[11px] uppercase tracking-[0.2em] px-5 py-2.5 border border-border text-muted hover:border-accent hover:text-accent transition-all duration-200"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}
