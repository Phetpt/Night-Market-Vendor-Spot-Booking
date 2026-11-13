"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

export default function AuthButtons() {
  const { data: session, status } = useSession()

  if (status === "loading") return null

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{session.user.name} · {session.user.role}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="border rounded-xl px-3 py-2 font-semibold border-slate-300 hover:bg-slate-50 w-24 text-center">
          Log out
        </button>
      </div>
    )
  }

  return(
    <section>
      <div className="flex items-center gap-4">
        <Link href="/register"
        className="border rounded-xl border-orange-400 px-3 py-2 text-ls font-semibold bg-orange-400 text-white hover:bg-orange-600 w-24 text-center">
          Sign up
        </Link>

        <Link href="/login" 
        className="border rounded-xl px-3 py-2 text-ls font-semibold border-slate-300 hover:bg-slate-50 w-24 text-center">
          Log in
        </Link>
      </div>
    </section>
  )
}