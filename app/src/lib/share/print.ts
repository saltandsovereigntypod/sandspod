// Printing a card's page. Phones have no print dialog without a native module
// this build doesn't carry, so they share the words instead (the share sheet
// offers Print on iOS and many Android phones). The web build prints: print.web.ts.

export const canPrint = false;

export async function printPage(_html: string): Promise<boolean> {
  return false;
}
