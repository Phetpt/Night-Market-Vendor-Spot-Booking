export type ActionResult = { ok: true } | { ok: false; message: string }

export function cancelMessage(status: number | undefined): string {
  switch (status) {
    case 403:
      return "You can't cancel this booking."
    case 429:
      return "Too many requests. Please wait a few minutes."
    case 400:
      return "This booking is invalid. Please refresh the page."
    case undefined:
      return "Can't reach the server. Please try again."
    default:
      return "Something went wrong. Please try again."
  }
}
