import type { Spot } from "./spot"
import type { User } from "./user"

export type BookingSpot = Omit<Spot, "createdAt" | "updatedAt">

export type Booking = {
  _id: string
  spot: BookingSpot           // Backend populate spot ให้ใน response
  user: User            // และ user ด้วย
  bookingDate: string   // ISO date จาก Mongo
  productType: string
  createdAt: string
  updatedAt: string
}

export type BookingInput = {
  spot: string          // id ของ spot (24 ตัวอักษร hex)
  bookingDate: string   // ต้องเป็น "YYYY-MM-DD" เท่านั้น และห้ามเป็นอดีต
  productType: string   // ห้ามว่าง
}
