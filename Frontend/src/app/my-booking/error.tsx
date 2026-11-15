"use client"

import { useEffect } from "react"

export default function MyBookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="px-6 py-8">
      <div className="space-y-3 rounded-2xl border border-red-300 bg-red-50 p-5">
        <p className="font-bold text-red-700">Something went wrong</p>
        <p className="text-sm text-red-700">
          We couldn&apos;t show your bookings. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-xl bg-[#8A3F1D] px-4 font-bold text-white hover:bg-[#6F3217] focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  )
}