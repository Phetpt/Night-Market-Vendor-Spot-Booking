import { zoneColor } from "./ZoneColour"
import { SpotCard } from "./SpotCard"
import type { SpotStatus, Spot } from "@/types/spot"

type Props = {
  spots: Spot[],
  statusOf: (spot: Spot)=> SpotStatus,
  onToggle: (id: string)=>void
}

export default function SpotGrid({spots, statusOf, onToggle}: Props) {

  const byZone = Object.groupBy(spots, (spot)=>spot.zone)
  // byZone = {
  //   'Fasion zone':   [ B01, B02, B03, B04 ],
  //   'Food zone':     [ A01, A02, A03, A04 ],
  //   'Handmade zone': [ C01, C02, C03, C04 ]
  // }


  const zones = Object.keys(byZone).sort((a, b) => {
    const firstA = byZone[a]![0].spotNumber
    const firstB = byZone[b]![0].spotNumber
    return firstA.localeCompare(firstB)
  })
  // zones = [ 'Fasion zone', 'Food zone', 'Handmade zone' ] เรียงตาม spotNumber -> [ 'Food zone', 'Fasion zone', 'Handmade zone' ]
  
    return (
    <div className="flex flex-col gap-4 ">
      {zones.map((zone) => (
        <section
          key={zone}
          className="rounded-2xl border border-[#DDE3F2] bg-white p-4 ">

          <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-[#1B2038] ">
            <span className="h-3 w-3 rounded-full "style={{ backgroundColor: zoneColor(zone) }}/>
            {zone}
          </h2>

          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 ">
            {byZone[zone]?.map((spot) => {
              const status =  statusOf(spot)

              return (
                <SpotCard key={spot._id} spot={spot} status={status} onToggle={onToggle}/>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

