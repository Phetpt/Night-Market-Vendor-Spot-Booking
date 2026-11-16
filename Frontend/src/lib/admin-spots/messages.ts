export function spotMessage(status?: number): string {
  switch (status) {
    case 400:
      return "Please check the fields and try again.";
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

export const spotErrors = {
  zoneRequired: "Select a zone.",
  zoneFull: (code: string) =>
    `Zone ${code} is full (99 spots). Create a new zone instead.`,
  zoneNameTaken: (name: string) => `A zone named "${name}" already exists.`,
  duplicateSuspected: (spotNumber: string) =>
    `Spot ${spotNumber} was saved, but another spot with the same number now exists. ` +
    `Another admin may have added one at the same time. Please check the list.`,
};
