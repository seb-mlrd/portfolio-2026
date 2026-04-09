import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // Allow login page through
  if (pathname === '/admin/login') {
    // Redirect to dashboard if already authenticated
    if (token?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.next()
  }

  // Protect all other /admin routes
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
