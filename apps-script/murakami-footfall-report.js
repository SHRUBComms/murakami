function updateReport() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Transactions by Weekday by Hour");
  const reportData = fetchReportData(sheet);

  for (let weekday = 0; weekday <= 6; weekday++) {
    const weekdayData = reportData.find((item) => item.Weekday === weekday);

    if (weekdayData) {
      writeWeekdayData(sheet, weekday, weekdayData);
    } else {
      writeMissingData(sheet, weekday);
    }
  }
}

function fetchReportData(sheet) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty("API_KEY");

  const startDate = sheet.getRange("B12").getValue().toISOString().split("T")[0];
  const endDate = sheet.getRange("B13").getValue().toISOString().split("T")[0];
  const tillName = `${sheet.getRange("B14").getValue()} Till`;

  const request =
    "https://murakami.shrubcoop.org/api/post/tills/reports/transactions-by-weekday-by-hour" +
    "?key=" +
    apiKey +
    `&startDate=${startDate}` +
    `&endDate=${endDate}` +
    `&tillName=${tillName}`;

  console.log(`Making API request: ${request}`);
  const response = UrlFetchApp.fetch(request, { method: "post" });

  if (response.status == "ok") {
    return response.data;
  } else {
    console.error("Response status: " + response.status);
  }
}

function writeWeekdayData(sheet, weekday, weekdayData) {
  const row = weekday + 2;

  sheet.getRange("B" + row).setValue(weekdayData["Before 11am"]);
  sheet.getRange("C" + row).setValue(weekdayData["11am-12pm"]);
  sheet.getRange("D" + row).setValue(weekdayData["12pm-1pm"]);
  sheet.getRange("E" + row).setValue(weekdayData["1pm-2pm"]);
  sheet.getRange("F" + row).setValue(weekdayData["2pm-3pm"]);
  sheet.getRange("G" + row).setValue(weekdayData["3pm-4pm"]);
  sheet.getRange("H" + row).setValue(weekdayData["4pm-5pm"]);
  sheet.getRange("I" + row).setValue(weekdayData["5pm-6pm"]);
  sheet.getRange("J" + row).setValue(weekdayData["6pm Onwards"]);
}

function writeMissingData(sheet, weekday) {
  const row = weekday + 2;

  sheet.getRange("B" + row).setValue(0);
  sheet.getRange("C" + row).setValue(0);
  sheet.getRange("D" + row).setValue(0);
  sheet.getRange("E" + row).setValue(0);
  sheet.getRange("F" + row).setValue(0);
  sheet.getRange("G" + row).setValue(0);
  sheet.getRange("H" + row).setValue(0);
  sheet.getRange("I" + row).setValue(0);
  sheet.getRange("J" + row).setValue(0);
}
