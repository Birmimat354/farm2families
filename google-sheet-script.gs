/**
 * Farm 2 Families Giving Gallop — sign-up receiver
 * Paste this into Extensions > Apps Script in your Google Sheet, then
 * Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * Copy the Web app URL into SHEET_ENDPOINT in js/main.js.
 */
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const d = JSON.parse(e.postData.contents);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Submitted", "First name", "Last name", "Email", "Gift card $", "Agreed to waiver", "Signature", "Browser"]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold");
  }

  sheet.appendRow([
    new Date(d.submittedAt || Date.now()),
    d.firstName || "",
    d.lastName || "",
    d.email || "",
    Number(d.amount) || 0,
    d.agreed ? "Yes" : "No",
    d.signature || "",
    d.userAgent || ""
  ]);

  // Optional: email yourself on each sign-up. Replace with your address and uncomment.
  // MailApp.sendEmail("you@example.com", "New Gallop sign-up: " + d.firstName + " " + d.lastName,
  //   d.firstName + " " + d.lastName + " (" + d.email + ") is bringing $" + d.amount + " in gift cards.");

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

// Lets you test the deployment by visiting the URL in a browser.
function doGet() {
  return ContentService.createTextOutput("Giving Gallop sign-up endpoint is live.");
}
