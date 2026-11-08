import { Spot, SpotStatus } from "@/types/spot";

const STYLES: Record<SpotStatus, string> = {
  available: "border-[#DDE3F2] bg-white text-[#1B2038]",
  booked: "border-transparent bg-[#E3E7F3] text-[#5B6180]",
  selected: "border-2 border-orange-700 bg-orange-100 text-orange-950",
  yours: "border-emerald-400 bg-emerald-50 text-emerald-900",
  limit: "border-dashed border-slate-300 bg-slate-100 text-slate-600",
};

const LABELS: Record<SpotStatus, string> = {
  available: "Available",
  booked: "Booked",
  selected: "Selected",
  yours: "You booked",
  limit: "Limit 3 of 3",
};

const LABEL_COLORS: Record<SpotStatus, string> = {
  available: "text-[#2F7A66]",
  booked: "text-[#5B6180]",
  selected: "text-[#6B2A0A]",
  yours: "text-emerald-700",
  limit: "text-slate-600",
};

type Props = {
  spot: Spot;
  status: SpotStatus;
  onToggle: (id: string)=>void
};

export function SpotCard({ spot, status, onToggle }: Props) {
  const disabled = status === "booked" || status === "yours" || status === "limit"

  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggle(spot._id)}
        className={`w-full rounded-2xl border p-4 text-left disabled:cursor-not-allowed ${STYLES[status]} hover:border-[#8A3F1D]/50 hover:bg-[#FFF4EC]`}>

        <span className={`block text-lg font-bold ${status === "booked" ? "line-through" : ""}`}>
          {spot.spotNumber}
        </span>
        <span className="block text-sm">
          {spot.spotSize} · ฿{spot.rentalFee}
        </span>
        <span className={`block text-sm font-semibold ${LABEL_COLORS[status]}`}>
          {LABELS[status]}
        </span>
      </button>
    </li>
  )
}
