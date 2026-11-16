import type { Metadata } from "next";
import { listSpots } from "@/lib/api/spots";
import type { Spot } from "@/types/spot";
import AdminSpotsExplorer from "@/components/admin/spots/AdminSpotsExplorer";

export const metadata: Metadata = {
  title: "Manage spots · Night Market Vendor Spot",
};

export default async function AdminSpotsPage() {
  let spots: Spot[] | null = null;

  try {
    spots = (await listSpots()).spots;
  } catch {}

  if (spots === null) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load spots. Please refresh the page.
        </div>
      </div>
    );
  }

  return <AdminSpotsExplorer spots={spots} />;
}
