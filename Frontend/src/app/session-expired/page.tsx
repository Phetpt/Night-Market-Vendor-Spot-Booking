import { getSafeCallbackUrl } from "@/lib/safe-redirect"
import SessionExpired from "./SessionExpired"

export default async function SessionExpiredPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  return <SessionExpired callbackUrl={getSafeCallbackUrl(callbackUrl, "/my-booking")} />
}
