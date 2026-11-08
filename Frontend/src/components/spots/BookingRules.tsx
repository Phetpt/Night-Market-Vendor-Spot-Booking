export default function BookingRules() {
  return (
    <div className="w-full rounded-3xl border border-indigo-100 bg-white px-6 py-5 flex flex-col items-start gap-2">
      <h2 className="text-lg font-bold text-slate-800">Booking rules</h2>
      <ul className="list-disc list-inside space-y-1.5 text-slate-600">
        <li>Up to 3 spots per day</li>
        <li>One booking per spot per day</li>
        <li>No dates before today</li>
      </ul>
    </div>
  )
}