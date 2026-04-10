import { prisma } from '@/lib/prisma'
import { MarkReadButton, DeleteButton } from './_components/MessageActions'

export const metadata = { title: 'Messages — Admin' }

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const unread = messages.filter((m) => !m.read).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Messages</h1>
          <p className="font-mono text-[11px] text-muted tracking-wider mt-1">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
            {unread > 0 && (
              <span className="text-accent ml-2">· {unread} non lu{unread !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="font-mono text-sm text-muted tracking-wider">Aucun message pour l'instant.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-px bg-border">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-bg-dark p-6 transition-colors duration-200 ${
                !msg.read ? 'border-l-2 border-accent' : 'border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-bold text-foreground">{msg.name}</span>
                  <span className="font-mono text-xs text-muted">{msg.email}</span>
                  {!msg.read && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 bg-accent/10 text-accent border border-accent/30">
                      Nouveau
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted shrink-0">
                  {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <p className="font-mono text-sm text-muted leading-relaxed mb-4 whitespace-pre-wrap">
                {msg.message}
              </p>

              <div className="flex items-center gap-2">
                {!msg.read && <MarkReadButton id={msg.id} />}
                <DeleteButton id={msg.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
