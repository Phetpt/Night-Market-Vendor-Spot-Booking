export const navigationItems = [
  { title: "Spot", pageRef: "/spots" },
  { title: "My Booking", pageRef: "/my-booking" },
] as const;

export const adminNavigationItems = [
  { title: "Upcoming bookings", pageRef: "/admin/bookings" },
  { title: "Manage spots", pageRef: "/admin/spots" },
] as const;
