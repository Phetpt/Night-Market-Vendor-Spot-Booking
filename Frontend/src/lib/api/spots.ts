import apiRequest from "./client";
import type { Spot, SpotInput } from "@/types/spot";

//ดึงรายการทั้งหมด
export async function listSpots() {
  const {data, count} = await apiRequest<Spot[]>("/spots")
  return {spots: data, count: count ?? data.length}
}

//ดึงรายการเดียว
export async function getSpotById(id: string) {
  const {data} = await apiRequest<Spot[]>(`/spots/${id}`)
  return data
}

//สร้างรายการใหม่
export async function createSpot(input: SpotInput, token: string) {
  const {data} = await apiRequest<Spot>("/spots", { method: "POST", body: input, token })
  return data
}

//แก้ไขรายการ
export async function updateSpot(id: string, input: Partial<SpotInput>, token: string) {
  const {data} = await apiRequest<Spot>(`/spots/${id}`, { method: "PUT", body: input, token })
  return data
}

//ลบรายการ 
export async function deleteSpot(id: string, token:string) {
  await apiRequest<Record<string, never>>(`/spots/${id}`, {method: "DELETE", token})
}