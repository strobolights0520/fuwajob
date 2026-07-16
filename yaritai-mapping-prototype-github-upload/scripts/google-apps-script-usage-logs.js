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

function doGet(event) {
  const expectedToken = PropertiesService.getScriptProperties().getProperty("FUWAJOB_LOG_TOKEN") || "";
  const token = event && event.parameter ? event.parameter.token || "" : "";

  if (expectedToken && token !== expectedToken) {
    return jsonOutput({ ok: false, error: "invalid_token" });
  }

  const mode = event && event.parameter ? event.parameter.mode || "" : "";
  if (mode !== "recent_inputs") {
    return jsonOutput({ ok: false, error: "invalid_mode" });
  }

  const limit = Math.max(1, Math.min(Number(event.parameter.limit || 10), 20));
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return jsonOutput({ ok: true, items: [] });
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const eventIndex = headers.indexOf("event_type");
  const inputIndex = headers.indexOf("input_text");
  const receivedIndex = headers.indexOf("received_at");
  const items = [];
  const seen = {};

  for (let rowIndex = values.length - 1; rowIndex >= 1 && items.length < limit; rowIndex -= 1) {
    const row = values[rowIndex];
    const eventType = String(row[eventIndex] || "");
    const inputText = String(row[inputIndex] || "").replace(/\s+/g, " ").trim();
    if (eventType !== "input_submitted" || !inputText || seen[inputText]) continue;
    seen[inputText] = true;
    items.push({
      input_text: inputText,
      received_at: row[receivedIndex] || "",
    });
  }

  return jsonOutput({ ok: true, items: items });
}

function jsonOutput(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
