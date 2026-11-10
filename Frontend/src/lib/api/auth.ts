import apiRequest from "./client";
import { AuthData, LoginInput, RegisterInput } from "@/types/auth";
import { User } from "@/types/user";

//สมัครสมาชิก
export async function register(input: RegisterInput) {
  const {data} = await apiRequest<AuthData>("/auth/register", {method: "POST", body: input})
  return data
}

//เข้าสู่ระบบ
export async function login(input: LoginInput) {
  const {data} = await apiRequest<AuthData>("/auth/login", {method: "POST", body: input})
  return data
}

//ดึงข้อมูล current user
export async function getMe(token: string) {
  const {data} = await apiRequest<User>("/auth/me", {token})
  return data
}

//ออกจากระบบ
export async function logout(token: string) {
  await apiRequest<Record<string, never>>("/auth/logout", {token})
}
