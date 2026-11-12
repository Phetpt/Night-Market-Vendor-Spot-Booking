import "next-auth"
import "next-auth/jwt"

type Role = "member" | "admin"

declare module "next-auth" {
  interface User {
    id: string
    role: Role
    token: string // token จาก backend
  }
  interface Session {
    accessToken: string
    user: { id: string; name: string; email: string; role: Role }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    accessToken: string
  }
}
