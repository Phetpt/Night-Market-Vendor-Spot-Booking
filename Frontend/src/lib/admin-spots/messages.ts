export function spotMessage(status?: number): string {
  switch (status) {
    case 400:
      return "Please check the fields. Every field is required and the fee must be a number.";
    case 401:
      return "Your session expired. Please log out and log in again.";
    case 403:
      return "Only admins can manage spots.";
    case 404:
      return "This spot no longer exists. Refresh the page.";
    case 409:
      return "That spot number already exists.";
    case 429:
      return "Too many requests. Please wait a few minutes.";
    case 500:
      return "The server couldn't save this spot. The spot number may already be used (even by a deleted spot).";
    case undefined:
      return "Can't reach the server.";
    default:
      return "Something went wrong.";
  }
}