function updateReport() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Transactions by Weekday by Hour");

  WipeReportData(sheet);
  const rawTransactionData = FetchTransactionData(sheet);
  const transformedTransactionData = TransformTransactionData(rawTransactionData);

  WriteHeatmaps(sheet, transformedTransactionData);
}

function WipeReportData(sheet) {
  const columns = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  for (let weekday = 0; weekday <= 6; weekday++) {
    columns.forEach((column) => sheet.getRange(column + (weekday + 3)).setValue(0));
    columns.forEach((column) => sheet.getRange(column + (weekday + 15)).setValue(0));
  }
}

function FetchTransactionData(sheet) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty("API_KEY");
  const merchantCode = scriptProperties.getProperty("MERCHANT_CODE");

  const startDate = sheet.getRange("B25").getValue().toISOString().split("T")[0];
  const endDate = sheet.getRange("B26").getValue().toISOString().split("T")[0];

  const request =
    "https://api.sumup.com/v2.1/merchants/" +
    merchantCode +
    "/transactions/history?limit=1000000&statuses[]=SUCCESSFUL" +
    "&oldest_time=" +
    startDate +
    "&newest_time=" +
    endDate;

  console.log("Making API request: " + request);
  const response = UrlFetchApp.fetch(request, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const responseCode = response.getResponseCode();

  if (responseCode !== 200) {
    console.error("Response code: " + responseCode);
    return null;
  } else {
    console.log("Response code: " + responseCode);
  }

  const responseBody = JSON.parse(response.getContentText());

  return responseBody.items;
}

function TransformTransactionData(rawTransactionData) {
  const transformedTransactionData = [];

  for (let t = 0; t < rawTransactionData.length; t++) {
    // Check it's a WSH transaction
    if (!(rawTransactionData[t].product_summary.toLowerCase().indexOf("wee spoke hub") >= 0)) {
      continue;
    }

    // Calculate the amount
    let amount = rawTransactionData[t].amount;
    if (rawTransactionData[t].status == "REFUNDED") {
      amount = rawTransactionData[t].amount * -1;
    } else if (rawTransactionData[t].refunded_amount > 0) {
      amount = rawTransactionData[t].amount - rawTransactionData[t].refunded_amount;
    }

    // Calculate the timestamp
    const timestamp = new Date(
      rawTransactionData[t].timestamp.replace(" ", "T").replace(/\.([0-9]{3})[0-9]*/, ".$1")
    );

    // Append to new array
    transformedTransactionData.push([amount, timestamp.getDay(), timestamp.getHours()]);
  }

  return transformedTransactionData;
}

function WriteHeatmaps(sheet, transformedTransactionData) {
  const cols = 11; // Number of time labels
  const quantityTransactionMatrix = Array.from({ length: 7 }, () => Array(cols).fill(0));
  const valueTransactionMatrix = Array.from({ length: 7 }, () => Array(cols).fill(0));

  transformedTransactionData.forEach((transaction) => {
    let col;
    if (transaction[2] <= 10) col = 0;
    else if (transaction[2] >= 20) col = cols - 1;
    else col = transaction[2] - 10;

    const row = (transaction[1] + 6) % 7;
    quantityTransactionMatrix[row][col] += 1;
    valueTransactionMatrix[row][col] += transaction[0];
  });

  sheet.getRange("B3:L9").setValues(quantityTransactionMatrix);
  sheet.getRange("B15:L21").setValues(valueTransactionMatrix);
}
