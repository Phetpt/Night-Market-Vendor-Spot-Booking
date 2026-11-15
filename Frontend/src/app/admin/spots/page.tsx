import { listSpots } from "@/lib/api/spots";
import type { Spot } from "@/types/spot";
import SpotFormButton from "@/components/admin/spots/SpotFormButton";
import DeleteSpotButton from "@/components/admin/spots/DeleteSpotButton";

function formatFee(fee: number) {
  return `฿${fee.toLocaleString("en-US")}`;
}

export default async function AdminSpotsPage() {
  let spots: Spot[] = []
  let failed = false

  try {
    spots = (await listSpots()).spots
  } catch {
    failed = true
  }

  // เรียง A01, A02, ..., A10 ให้ถูก (numeric)
  const sorted = [...spots].sort((a, b) =>
    a.spotNumber.localeCompare(b.spotNumber, undefined, { numeric: true }),
  );
  const takenNumbers = sorted.map((s) => s.spotNumber);

  return (
    <div className="space-y-6 px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2038]">Manage spots</h1>
          <p className="mt-1 text-sm text-[#4A5470]">
            {sorted.length} active spots
          </p>
        </div>
        <SpotFormButton mode="create" takenNumbers={takenNumbers} />
      </div>

      {failed ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn&apos;t load spots. Please refresh the page.
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-[#DDE3F2] bg-white p-8 text-center text-sm text-[#4A5470]">
          No active spots yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#DDE3F2] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DDE3F2] text-xs uppercase text-[#4A5470]">
              <tr>
                <th className="px-4 py-3">Spot</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Rental fee</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((spot) => (
                <tr
                  key={spot._id}
                  className="border-b border-[#DDE3F2] last:border-0 hover:bg-[#FFF4EC]"
                >
                  <td className="px-4 py-3 font-semibold text-[#1B2038]">
                    {spot.spotNumber}
                  </td>
                  <td className="px-4 py-3 text-[#1F2A44]">{spot.zone}</td>
                  <td className="px-4 py-3 text-[#1F2A44]">{spot.spotSize}</td>
                  <td className="px-4 py-3 text-[#4A5470]">
                    {spot.locationDescription}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#A33900]">
                    {formatFee(spot.rentalFee)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-4">
                      <SpotFormButton mode="edit" spot={spot} takenNumbers={takenNumbers} />
                      <DeleteSpotButton
                        spotId={spot._id}
                        spotNumber={spot.spotNumber}
                        zone={spot.zone}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}