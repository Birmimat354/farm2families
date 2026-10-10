/**
 * Farm 2 Families Giving Gallop — sign-up receiver (v2)
 * Records sign-ups, and marks "Donation reported" when a galloper taps "I made my donation".
 * After pasting: Deploy > Manage deployments > pencil > Version: New version > Deploy.
 */
const HEADERS = ["Submitted", "First name", "Last name", "Email", "Gift card $", "Agreed to waiver", "Signature", "Donation reported", "Browser"];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const d = JSON.parse(e.postData.contents);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }

  if (d.type === "donation") {
    // Mark every row with this email (one household may register several gallopers)
    const rows = sheet.getDataRange().getValues();
    const email = String(d.email || "").trim().toLowerCase();
    let hits = 0;
    for (let r = 1; r < rows.length; r++) {
      if (String(rows[r][3]).trim().toLowerCase() === email) { sheet.getRange(r + 1, 8).setValue("Yes — " + new Date().toLocaleDateString()); hits++; }
    }
    if (!hits) sheet.appendRow([new Date(), d.firstName || "", d.lastName || "", d.email || "", "", "", "", "Yes (no matching sign-up)", d.userAgent || ""]);
    return ok();
  }

  sheet.appendRow([
    new Date(d.submittedAt || Date.now()),
    d.firstName || "",
    d.lastName || "",
    d.email || "",
    Number(d.amount) || 0,
    d.agreed ? "Yes" : "No",
    d.signature || "",
    "",
    d.userAgent || ""
  ]);
  return ok();
}

function ok() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput("Giving Gallop sign-up endpoint is live.");
}
