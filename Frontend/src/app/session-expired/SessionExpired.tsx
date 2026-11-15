"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"

export default function SessionExpired({ callbackUrl }: { callbackUrl: string }) {
  useEffect(() => {
    signOut({ callbackUrl: `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` })
  }, [callbackUrl])

  return <p className="px-6 py-8">Your session has expired. Signing you out…</p>
}
