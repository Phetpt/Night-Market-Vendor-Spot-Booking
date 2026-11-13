import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req }) // อ่าน NEXTAUTH_SECRET จาก env เอง

  const { pathname } = req.nextUrl
  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isAuthPage) {
    if (token) return NextResponse.redirect(new URL("/spots", req.url))
    return NextResponse.next()
  }

  if (!token) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ["/my-booking/:path*", "/login", "/register"] }
