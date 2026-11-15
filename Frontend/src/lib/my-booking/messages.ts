export type ActionResult = { ok: true } | { ok: false; message: string }

export function cancelMessage(status: number | undefined): string {
  switch (status) {
    case 400:
      return "This booking is invalid. Please refresh the page."
    case 401:
      return "Your session expired. Please log out and log in again."
    case 403:
      return "You can't cancel this booking."
    case 429:
      return "Too many requests. Please wait a few minutes."
    case undefined:
      return "Can't reach the server. Please try again."
    default:
      return "Something went wrong. Please try again."
  }
}

export function updateMessage(status: number | undefined): string {
  switch (status) {
    case 400:
      return "Please pick today or a later date and fill in the product type."
    case 401:
      return "Your session expired. Please log out and log in again."
    case 403:
      return "You can't change this booking."
    case 404:
      return "This booking or spot is no longer available. Refresh the page."
    case 409:
      return "That spot is already taken on this date, or you've reached 3 spots for that night."
    case 429:
      return "Too many requests. Please wait a few minutes."
    case undefined:
      return "Can't reach the server. Please try again."
    default:
      return "Something went wrong. Please try again."
  }
}
