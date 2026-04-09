@AGENTS.md

# Next.js 16 — Conventions & règles de code

## App Router uniquement

Ce projet utilise **exclusivement** l'App Router (`src/app/`). Ne jamais utiliser le Pages Router.

---

## Server Components vs Client Components

**Par défaut, tous les composants sont des Server Components.** N'ajouter `'use client'` que si strictement nécessaire.

Utiliser un **Client Component** uniquement quand le composant a besoin de :
- State (`useState`) ou event handlers (`onClick`, `onChange`)
- Lifecycle (`useEffect`)
- APIs navigateur (`localStorage`, `window`, `navigator`)
- Hooks personnalisés qui dépendent de ce qui précède

Utiliser un **Server Component** pour :
- Fetch de données (DB, API externe)
- Accès aux secrets / variables d'environnement non préfixées `NEXT_PUBLIC_`
- Réduire le JS envoyé au client

**Règle d'or :** pousser `'use client'` aussi bas que possible dans l'arbre. Un layout ou une page ne doit presque jamais être un Client Component.

```tsx
// ✅ Bon : seul le bouton interactif est client
// app/projects/page.tsx — Server Component
import LikeButton from './_components/LikeButton' // 'use client' ici

export default async function Page() {
  const projects = await prisma.project.findMany()
  return projects.map(p => <LikeButton key={p.id} project={p} />)
}
```

---

## Data fetching

### Dans les Server Components : accès direct à la DB via Prisma

```tsx
// ✅ Correct — pas besoin de passer par une API route
import { prisma } from '@/lib/prisma'

export default async function Page() {
  const projects = await prisma.project.findMany({ where: { published: true } })
  // ...
}
```

Ne jamais créer de route API (`route.ts`) juste pour que la page fetch ses propres données.

### `fetch` n'est pas caché par défaut

En Next.js 16, `fetch` n'est **plus** mis en cache automatiquement. Pour mettre en cache, utiliser la directive `'use cache'` :

```tsx
// Pour cacher le résultat d'une fonction
import { unstable_cache as cache } from 'next/cache'

const getProjects = cache(async () => {
  return prisma.project.findMany()
}, ['projects'])
```

### Params et searchParams sont des Promises

En Next.js 16, `params` et `searchParams` sont **asynchrones** :

```tsx
// ✅ Correct
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
}
```

---

## Mutations — Server Functions / Server Actions

Utiliser des **Server Functions** (`'use server'`) pour toutes les mutations. Ne pas créer de route API `POST` pour les mutations internes.

```ts
// src/lib/actions/projects.ts
'use server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.project.create({ data: { /* ... */ } })
  revalidatePath('/projects')
}
```

**Important :** toujours vérifier l'authentification/autorisation dans chaque Server Function — elles sont accessibles via POST direct.

---

## Route Handlers (`route.ts`)

Réservés aux cas suivants uniquement :
- Endpoint consommé par un client externe (mobile, webhook, etc.)
- NextAuth (`/api/auth/[...nextauth]`)
- Endpoint nécessitant un contrôle fin des headers HTTP

```ts
// app/api/contact/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  // ...
  return Response.json({ ok: true }, { status: 201 })
}
```

Un fichier `route.ts` ne peut **pas** coexister au même niveau qu'un `page.tsx`.

---

## Structure des fichiers

```
src/
  app/
    (marketing)/          # Route group — layout public
      page.tsx
      layout.tsx
    (admin)/              # Route group — layout back-office
      admin/
        page.tsx
      layout.tsx
    api/
      auth/[...nextauth]/
        route.ts
  lib/
    prisma.ts             # Client Prisma singleton
    auth.ts               # Config NextAuth
    actions/              # Server Functions
  components/             # Composants partagés
    ui/                   # Composants UI génériques
```

- Préfixer les dossiers non-routables par `_` (ex: `_components/`, `_lib/`)
- Utiliser les **route groups** `(nom)` pour partager des layouts sans impacter l'URL

---

## Fichiers spéciaux App Router

| Fichier | Rôle |
|---|---|
| `layout.tsx` | Layout persistant (ne se re-render pas à la navigation) |
| `page.tsx` | Contenu de la route — rend la route publique |
| `loading.tsx` | Skeleton affiché pendant le streaming (Suspense automatique) |
| `error.tsx` | Error boundary de la route (`'use client'` obligatoire) |
| `not-found.tsx` | Affiché quand `notFound()` est appelé |
| `route.ts` | API endpoint |

---

## Metadata & SEO

Exporter `metadata` depuis un `page.tsx` ou `layout.tsx` (Server Component uniquement) :

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mon Portfolio',
  description: '...',
}
```

Pour les métadonnées dynamiques, utiliser `generateMetadata` :

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await prisma.project.findUnique({ where: { slug } })
  return { title: project?.title }
}
```

---

## Variables d'environnement

- `NEXT_PUBLIC_*` → exposées au client (bundle JS)
- Toutes les autres → server-only (ne jamais les lire dans un Client Component)
- Pour les modules server-only sensibles, importer `'server-only'` en tête de fichier

---

## Streaming

Wrapper les composants lents dans `<Suspense>` pour streamer le contenu progressivement :

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsList />
      </Suspense>
    </>
  )
}
```

Ou utiliser un fichier `loading.tsx` pour appliquer le Suspense à toute la route.
