import apiRequest from "./client";
import type { Booking, BookingInput } from "@/types/booking";

// ดึงรายการ spot id ที่ถูกจองไปแล้วในวันที่ระบุ (public, ไม่ต้อง login)
export async function getBookedSpotIds(date: string) {
  const { data } = await apiRequest<string[]>(`/bookings/availability?date=${date}`);
  return data;
}

// member เห็นของตัวเอง, admin เห็นทั้งหมด
export async function listBookings(token: string) {
  const { data, count } = await apiRequest<Booking[]>("/bookings", { token });
  return { bookings: data, count: count ?? data.length };
}

export async function getBookingById(id: string, token: string) {
  const { data } = await apiRequest<Booking>(`/bookings/${id}`, { token });
  return data;
}

export async function createBooking(input: BookingInput, token: string) {
  const { data } = await apiRequest<Booking>("/bookings", { method: "POST", body: input, token });
  return data;
}

export async function updateBooking(id: string, input: Partial<BookingInput>, token: string) {
  const { data } = await apiRequest<Booking>(`/bookings/${id}`, { method: "PUT", body: input, token });
  return data;
}

export async function deleteBooking(id: string, token: string) {
  await apiRequest<Record<string, never>>(`/bookings/${id}`, { method: "DELETE", token });
}
