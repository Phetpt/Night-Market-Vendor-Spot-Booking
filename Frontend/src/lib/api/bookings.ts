import apiRequest from "./client";

// ดึงรายการ spot id ที่ถูกจองไปแล้วในวันที่ระบุ (public, ไม่ต้อง login)
export async function getBookedSpotIds(date: string) {
  const { data } = await apiRequest<string[]>(`/bookings/availability?date=${date}`);
  return data;
}