// 1. spot for 1 block
export type Spot = {
  _id: string,
  spotNumber: string,
  zone: string,
  spotSize: string,
  locationDescription: string
  rentalFee: number,
  isActive: boolean,
  createdAt: string
  updatedAt: string,
} 

export type SpotInput = {
  spotNumber: string
  zone: string
  spotSize: string
  locationDescription: string
  rentalFee: number
}

// 2. Spot Status
export type SpotStatus = 'available' | 'booked' | 'selected' | 'yours' | 'limit'