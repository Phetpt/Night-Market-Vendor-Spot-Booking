'use client'
import BookingRules from "./BookingRules"
import DateStrip from "./DateStrip"
import ZoneTabs from "./ZoneTabs"
import SpotGrid from "./SpotGrid"
import SelectionPanel from "./SelectionPanel"
import type { Spot, SpotStatus } from "@/types/spot"
import { useState } from "react"

type Props = {
  spots: Spot[],
  bookedSpotIds: string[],
  selectedDate: string,
  today: string
}

const MAX_PER_DAY = 3


export default function SpotsExpolorer({spots, bookedSpotIds, selectedDate, today}: Props) {

const [selectedIds, setSelectedIds] = useState<string[]>([]) //array เพราะผู้ใช้เลือกได้หลายช่อง

  //function for calculate status
function statusOf(spot: Spot): SpotStatus {
  if(bookedSpotIds.includes(spot._id)) return "booked"
  if(selectedIds.includes(spot._id)) return "selected"
  if(selectedIds.length >= MAX_PER_DAY) return "limit"
  return 'available'
}

//functon ถ้าเลือกอยู่ให้เอาออก ถ้าไม่ได้เลือก ให้เลือก
function toggle(id: string) {
  setSelectedIds((prev)=> prev.includes(id) ? prev.filter((x)=>x !== id) : [...prev, id])
}

const selectedSpots = spots.filter((spot)=>selectedIds.includes(spot._id))



  return(
    <main className="px-6 py-8 space-y-6">
      <div>
        <h1 className="font-bold text-3xl text-[#1F2A44]">Pick a spot for your night</h1>
        <h2 className="text-[#4A5470]">Choose a date to see what&apos;s open. Anyone can browse, and you log in when you&apos;re ready to book.</h2>
        <DateStrip value={selectedDate} today={today}/>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
        <section className="space-y-6">
          <ZoneTabs/>
          <SpotGrid spots={spots} statusOf={statusOf} onToggle={toggle}/>
        </section>

        <aside className="sticky top-6 space-y-4">
          <SelectionPanel selectedSpots={selectedSpots} onRemove={toggle}/>
          <BookingRules/>
        </aside>
      </div>  
    </main>
  )
}