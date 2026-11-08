import type { Spot } from "@/types/spot"

type Props = {
  selectedSpots: Spot[]
  onRemove: (id: string)=>void
}

export default function SelectionPanel({selectedSpots, onRemove}: Props) {

  const total = selectedSpots.reduce((sum, spot)=> sum + spot.rentalFee, 0)

  return(
    <div className="w-full rounded-3xl border border-indigo-100 bg-white px-6 py-5 flex flex-col items-start gap-2">
      <h2 className="font-bold text-xl ">Your selection</h2>
      {selectedSpots.length > 0 && <p className="text-sm text-[#4A5470]">{selectedSpots.length} of 3 spots</p> }
      

      {selectedSpots.length === 0 ? (<p className="text-sm text-[#4A5470]">Pick a spot from the list to start.</p>) : (
        
        <ul className="flex w-full flex-col gap-2">
        {selectedSpots.map((spot)=>(
          <li key={spot._id} 
          className="flex items-center justify-between rounded-xl border border-indigo-100 p-3">
            <div>
              <div className="font-bold">{spot.spotNumber}</div>
              <div className="text-sm text-[#4A5470]">
                  {spot.zone} · {spot.spotSize}
              </div>
            </div>
            <span className="font-bold">฿{spot.rentalFee}</span> 
            <button type="button" 
            onClick={()=>onRemove(spot._id)}
            aria-label="`Remove ${spot.spotNumber}`}"
            className="flex size-8 items-center justify-center rounded-lg border border-indigo-100 text-[#4A5470] hover:bg-slate-100">
              X
            </button>   
          </li>
       
        ))}
      </ul>
      )}
      {selectedSpots.length > 0 && 
      <div className="mt-2 flex w-full items-center justify-between border-t border-indigo-100 pt-4">
        <span className="text-sm text-[#4A5470]">Total</span>
        <span className="font-bold text-xl text-[#A33900]">฿ {total}/day</span>
      </div>
    }
      
    </div>
  )
}