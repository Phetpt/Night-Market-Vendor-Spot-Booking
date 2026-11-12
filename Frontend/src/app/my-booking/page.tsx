import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { listBookings } from "@/lib/api/bookings"

export default async function MyBookingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login") // กันซ้ำอีกชั้น ต่อให้ proxy พลาดก็ไม่หลุด

  const { bookings } = await listBookings(session.accessToken)

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">My Booking</h1>
      <ul>
        {bookings.map((booking) => (
          <li key={booking._id}>
            {booking.spot.zone} · {booking.bookingDate.slice(0, 10)} · {booking.productType}
          </li>
        ))}
      </ul>
    </main>
  )
}
