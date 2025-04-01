function updateReport() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Transactions by Weekday by Hour");

  const reportData = fetchReportData(sheet);
  wipeReportData(sheet);

  for (let i = 0; i < reportData.length; i++) {
    writeReportData(sheet, reportData[i]);
  }
}

function fetchReportData(sheet) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty("API_KEY");

  const startDate = sheet.getRange("B25").getValue().toISOString().split("T")[0];
  const endDate = sheet.getRange("B26").getValue().toISOString().split("T")[0];
  const tillName = sheet.getRange("B27").getValue();

  const request =
    "https://murakami.shrubcoop.org/api/post/tills/reports/transactions-by-weekday-by-hour" +
    "?key=" +
    apiKey +
    "&startDate=" +
    startDate +
    "&endDate=" +
    endDate +
    "&tillName=" +
    encodeURIComponent(tillName);

  console.log("Making API request: " + request);
  const response = UrlFetchApp.fetch(request, { method: "post" });

  const responseCode = response.getResponseCode();
  if (responseCode !== 200) {
    console.error("Response code: " + responseCode);
    return null;
  }

  const responseBody = JSON.parse(response.getContentText());
  if (responseBody.status !== "ok") {
    console.error("Response status: " + responseBody.status);
    return null;
  }

  return responseBody.data;
}

function wipeReportData(sheet) {
  const columns = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  for (let weekday = 0; weekday <= 6; weekday++) {
    columns.forEach((column) => sheet.getRange(column + (weekday + 3)).setValue(0));
    columns.forEach((column) => sheet.getRange(column + (weekday + 15)).setValue(0));
  }
}

function writeReportData(sheet, data) {
  const weekday = data.transaction_weekday;
  const hour = data.transaction_hour;

  const column_map = {
    "Before 11am": "B",
    "11am-12pm": "C",
    "12pm-1pm": "D",
    "1pm-2pm": "E",
    "2pm-3pm": "F",
    "3pm-4pm": "G",
    "4pm-5pm": "H",
    "5pm-6pm": "I",
    "6pm-7pm": "J",
    "7pm-8pm": "K",
    "8pm Onwards": "L",
  };
  const column = column_map[hour];

  sheet.getRange(column + (weekday + 3)).setValue(data.total_quantity);
  sheet.getRange(column + (weekday + 15)).setValue(parseFloat(data.total_value).toFixed(2));
}
