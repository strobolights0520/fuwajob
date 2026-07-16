const SHEET_NAME = "usage_logs";
const HEADERS = [
  "received_at",
  "event_type",
  "session_id",
  "input_text",
  "ai_summary",
  "verbs",
  "nouns",
  "values",
  "question_title",
  "question_body",
  "question_choices",
  "selected_answer",
  "result_headline",
  "near_paths",
  "wide_paths",
  "industries",
  "page_url",
  "app_version",
];

function doPost(event) {
  const payload = JSON.parse(event.postData.contents || "{}");
  const expectedToken = PropertiesService.getScriptProperties().getProperty("FUWAJOB_LOG_TOKEN") || "";

  if (expectedToken && payload.token !== expectedToken) {
    return jsonOutput({ ok: false, error: "invalid_token" });
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  const row = HEADERS.map((header) => payload[header] || "");
  sheet.appendRow(row);

  return jsonOutput({ ok: true });
}

function jsonOutput(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
