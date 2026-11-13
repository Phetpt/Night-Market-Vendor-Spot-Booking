import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { login } from "@/lib/api/auth"
import { validateLogin } from "@/lib/validation/auth"
import type { ApiError } from "@/types/api"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 วัน เท่าเดิม
  pages: { signIn: "/login" }, // ใช้หน้า login ของเราเอง
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const result = validateLogin(credentials as never)
        if (!result.ok) throw new Error("Invalid email or password")

        try {
          const auth = await login(result.data)
          return {
            id: auth.id,
            name: auth.name,
            email: auth.email,
            role: auth.role,
            token: auth.token,
          }
        } catch (err) {
          const status = (err as Partial<ApiError>)?.status

          if (status === 400 || status === 401) {
            throw new Error("Incorrect email or password")
          }
          if (status === 429) {
            throw new Error("Too many attempts, please try again in a few minutes")
          }
          if (status === undefined) {
            // ไม่มี status = ไม่ได้คุยกับ backend สำเร็จ (เน็ตหลุด / backend ล่ม)
            throw new Error("Can't reach the server, please try again")
          }
          throw new Error("Something went wrong, please try again")
        }
      },
    }),
  ],
  callbacks: {
    // รันตอน login (มี user) และทุกครั้งที่อ่าน session
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.accessToken = user.token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
}
