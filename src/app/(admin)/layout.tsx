import NextAuthProvider from '@/components/SessionProvider'
import AdminSidebar from './admin/_components/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </NextAuthProvider>
  )
}
