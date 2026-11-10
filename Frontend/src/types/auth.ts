import type { User } from "./user"

export type RegisterInput = {
  "name": string,
  "email": string,
  "tel": string,
  "password": string,
  "role"?: User["role"]
}

export type LoginInput = {
  
  "email": string,
  "password": string
}

export type AuthData = {
  id: string
  name: string
  email: string
  role: User["role"]
  token: string  
}

