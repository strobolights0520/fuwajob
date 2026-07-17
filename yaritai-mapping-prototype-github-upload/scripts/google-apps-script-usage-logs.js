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

  const spreadsheet = openLogSpreadsheet();
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
  const debug = event && event.parameter ? event.parameter.debug === "1" : false;

  if (expectedToken && token !== expectedToken) {
    return jsonOutput({ ok: false, error: "invalid_token" });
  }

  const mode = event && event.parameter ? event.parameter.mode || "" : "";
  if (mode !== "recent_inputs") {
    return jsonOutput({ ok: false, error: "invalid_mode" });
  }

  const limit = Math.max(1, Math.min(Number(event.parameter.limit || 10), 20));
  const spreadsheet = openLogSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return jsonOutput({
      ok: true,
      items: [],
      debug: debug ? buildDebug(spreadsheet, sheet, [], "sheet_missing_or_empty") : undefined,
    });
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const eventIndex = headers.indexOf("event_type");
  const inputIndex = headers.indexOf("input_text");
  const receivedIndex = headers.indexOf("received_at");
  const items = [];
  const fallbackItems = [];
  const seen = {};
  const fallbackSeen = {};

  for (let rowIndex = values.length - 1; rowIndex >= 1 && (items.length < limit || fallbackItems.length < limit); rowIndex -= 1) {
    const row = values[rowIndex];
    const eventType = String(row[eventIndex] || "");
    const inputText = String(row[inputIndex] || "").replace(/\s+/g, " ").trim();
    if (!inputText) continue;

    const item = {
      input_text: inputText,
      received_at: row[receivedIndex] || "",
    };

    if (!fallbackSeen[inputText] && fallbackItems.length < limit) {
      fallbackSeen[inputText] = true;
      fallbackItems.push(item);
    }

    if (eventType === "input_submitted" && !seen[inputText] && items.length < limit) {
      seen[inputText] = true;
      items.push(item);
    }
  }

  return jsonOutput({
    ok: true,
    items: items.length ? items : fallbackItems,
    debug: debug ? buildDebug(spreadsheet, sheet, headers, items.length ? "input_submitted_found" : "fallback_or_empty") : undefined,
  });
}

function openLogSpreadsheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") || "";
  if (spreadsheetId) return SpreadsheetApp.openById(spreadsheetId);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function buildDebug(spreadsheet, sheet, headers, status) {
  return {
    status: status,
    spreadsheet_name: spreadsheet ? spreadsheet.getName() : "",
    sheet_name: sheet ? sheet.getName() : "",
    last_row: sheet ? sheet.getLastRow() : 0,
    headers: headers || [],
    has_event_type: headers ? headers.indexOf("event_type") !== -1 : false,
    has_input_text: headers ? headers.indexOf("input_text") !== -1 : false,
  };
}

function jsonOutput(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
