import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata = { title: 'Dashboard — Admin' }

const dateFmt = (d: Date) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

async function getData() {
  const [
    latestMessages,
    recentProjects, recentExperiences, recentEducations, recentSkills,
  ] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, subject: true, message: true, read: true, createdAt: true },
    }),
    prisma.project.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, published: true, updatedAt: true } }),
    prisma.experience.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, role: true, company: true, published: true, updatedAt: true } }),
    prisma.education.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, degree: true, published: true, updatedAt: true } }),
    prisma.skill.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, published: true, updatedAt: true } }),
  ])

  const recent = [
    ...recentProjects.map((p) => ({ type: 'Projet', label: p.title, published: p.published, updatedAt: p.updatedAt, href: `/admin/projects/${p.id}/edit` })),
    ...recentExperiences.map((e) => ({ type: 'Expérience', label: `${e.role} — ${e.company}`, published: e.published, updatedAt: e.updatedAt, href: `/admin/experiences/${e.id}/edit` })),
    ...recentEducations.map((e) => ({ type: 'Formation', label: e.degree, published: e.published, updatedAt: e.updatedAt, href: `/admin/educations/${e.id}/edit` })),
    ...recentSkills.map((s) => ({ type: 'Compétence', label: s.title, published: s.published, updatedAt: s.updatedAt, href: `/admin/skills/${s.id}/edit` })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6)

  return { latestMessages, recent }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{children}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const { latestMessages, recent } = await getData()

  const quickActions = [
    { label: '+ Projet', href: '/admin/projects/new' },
    { label: '+ Expérience', href: '/admin/experiences/new' },
    { label: '+ Formation', href: '/admin/educations/new' },
    { label: '+ Compétence', href: '/admin/skills/new' },
    { label: 'Voir le portfolio ↗', href: '/' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-1">Bienvenue,</p>
          <h1 className="font-mono text-2xl font-bold tracking-tight">{session?.user?.name ?? 'Admin'}</h1>
        </div>
        <p className="font-mono text-[11px] text-muted tracking-wider">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Quick actions */}
      <SectionTitle>Accès rapide</SectionTitle>
      <div className="flex flex-wrap gap-3 mb-12">
        {quickActions.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="font-mono text-[11px] uppercase tracking-[0.2em] px-5 py-2.5 border border-border text-muted hover:border-accent hover:text-accent transition-all duration-200"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Latest messages */}
        <section>
          <SectionTitle>Derniers messages</SectionTitle>
          {latestMessages.length === 0 ? (
            <div className="border border-border p-8 text-center">
              <p className="font-mono text-xs text-muted tracking-wider">Aucun message pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-px bg-border">
              {latestMessages.map((msg) => (
                <Link
                  key={msg.id}
                  href="/admin/messages"
                  className={`bg-bg-dark p-4 hover:bg-bg-light transition-colors duration-200 border-l-2 ${
                    msg.read ? 'border-transparent' : 'border-accent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-mono text-xs font-bold text-foreground truncate">
                      {msg.name}
                      {!msg.read && <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-accent">Nouveau</span>}
                    </span>
                    <span className="font-mono text-[10px] text-muted shrink-0">{dateFmt(msg.createdAt)}</span>
                  </div>
                  <p className="font-mono text-[11px] text-muted truncate">{msg.subject || msg.message}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent changes */}
        <section>
          <SectionTitle>Dernières modifications</SectionTitle>
          {recent.length === 0 ? (
            <div className="border border-border p-8 text-center">
              <p className="font-mono text-xs text-muted tracking-wider">Aucun contenu pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-px bg-border">
              {recent.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-bg-dark p-4 hover:bg-bg-light transition-colors duration-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted mb-1">{item.type}</p>
                    <p className="font-mono text-xs text-foreground group-hover:text-accent transition-colors duration-200 truncate">
                      {item.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {!item.published && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border border-border text-muted">
                        Brouillon
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-muted">{dateFmt(item.updatedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
