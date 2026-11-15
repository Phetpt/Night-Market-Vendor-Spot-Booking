import { Bookmark, Pencil, X } from "lucide-react"

type Props = {
  refCode: string
  editing: boolean
  subtitle: string
  pending: boolean
  onClose: () => void
}

export default function EditBookingHeader({
  refCode,
  editing,
  subtitle,
  pending,
  onClose,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBE3D6] px-3 py-1 text-xs font-bold text-[#8A3F1D]">
            <Bookmark className="size-3.5" />
            {refCode}
          </span>
          {editing ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-900">
              <Pencil className="size-3.5" />
              Editing
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-900">
              <span className="size-2 rounded-full bg-emerald-600" />
              Confirmed spot
            </span>
          )}
        </div>
        <h2 className="text-3xl font-bold text-[#1F2A44]">
          {editing ? "Edit Booking" : "Booking Details"}
        </h2>
        <p className="text-[#4A5470]">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        disabled={pending}
        aria-label="Close"
        className="flex size-10 items-center justify-center rounded-xl bg-[#EFF4FF] text-[#1B2038] hover:bg-slate-200 disabled:opacity-50"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
