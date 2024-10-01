var SpreadSheet = SpreadsheetApp.getActiveSpreadsheet();

var grandTotalsSheet = SpreadSheet.getSheetByName("Grand Totals");
var allWorkingGroupsSheet = SpreadSheet.getSheetByName("All Working Groups");
var workingGroupSheets = {};

// Check if sheet for working group exists - if not, create it.
function createSheet(sheet) {
  var sheetName = sheet.name + " (" + sheet.group_id + ")";
  var sheetExists = SpreadSheet.getSheetByName(sheetName);
  if (!sheetExists) {
    SpreadSheet.insertSheet(sheetName)
  }

  return SpreadSheet.getSheetByName(sheetName);
}

function getSheetHeaders() {
  headers = ["Month"]; // Leave first column blank
  disposalMethods = [
    { id: "recycled", name: "Recycled" },
    { id: "generated", name: "Generated" },
    { id: "incinerated", name: "Incinerated" },
    { id: "landfilled", name: "Landfilled" },
    { id: "composted", name: "Composted" },
    { id: "reused", name: "Reused" },
    { id: "reuse-partners", name: "Reuse Partners" },
    { id: "stored", name: "Stored" },
    { id: "other", name: "Other" }
  ]

  disposalMethods.forEach(function (disposalMethod) {
    headers.push(disposalMethod.name);
    headers.push(""); // Blank header to merge to make double width.
  })

  return headers;
}

function writeHeaders(sheet, headers) {

  for (var column = 0; column < headers.length; column++) {
    var cellAsAlpha = getColumnAsAlpha(column) + "1";
    sheet.getRange(cellAsAlpha).setValue(headers[column]);
  };

  // Merge headers
  for (var column = 1; column < headers.length; column += 2) {
    var firstCellAsAlpha = getColumnAsAlpha(column) + "1";
    var secondCellAsAlpha = getColumnAsAlpha(column + 1) + "1";
    sheet.getRange(firstCellAsAlpha + ":" + secondCellAsAlpha).mergeAcross();
  }

  // Write sub-headers
  for (var column = 1; column < headers.length; column++) {
    var cellAsAlpha = getColumnAsAlpha(column) + "2";
    var subHeader = "Raw Weight (kg)";
    if (column % 2 == 0) {
      subHeader = "Carbon Saved (kg)";
    }
    sheet.getRange(cellAsAlpha).setValue(subHeader);
  }

  // Merge month header
  sheet.getRange("A1:A2").mergeAcross();
}

function getColumnAsAlpha(column) {
  return (column + 10).toString(36);
}

function writeCarbonAccountingReport(workingGroups, carbonReport) {
  var headers = getSheetHeaders();
  writeHeaders(allWorkingGroupsSheet, headers);
  writeAllWorkingGroups(allWorkingGroupsSheet, carbonReport);


  var row = 2;
  Object.keys(workingGroups).forEach(function (group_id) {
    var column = 0;
    var sheet = createSheet(workingGroups[group_id]);
    writeHeaders(sheet, headers);
    writeWorkingGroupData(sheet, carbonReport, group_id);

    row += 1;
  })

}

function writeWorkingGroupData(sheet, carbonReport, group_id) {
  // Write months
  column = 0;
  row = 3;

  carbonReportMonthKeys = Object.keys(carbonReport);

  for (var i = 0; i < carbonReportMonthKeys.length; i++) {

    var monthKey = carbonReportMonthKeys[i];
    var cellAsAlpha = getColumnAsAlpha(column) + row;
    sheet.getRange(cellAsAlpha).setValue(monthKey);

    dataColumn = 1;

    Object.keys(carbonReport[monthKey]["byWorkingGroup"][group_id]).forEach(function (disposalMethod) {

      // Write raw data
      cellAsAlpha = getColumnAsAlpha(dataColumn) + row;
      sheet.getRange(cellAsAlpha).setValue(carbonReport[monthKey]["byWorkingGroup"][group_id][disposalMethod].raw);

      // Write carbon saved data
      cellAsAlpha = getColumnAsAlpha(dataColumn + 1) + row;
      sheet.getRange(cellAsAlpha).setValue(carbonReport[monthKey]["byWorkingGroup"][group_id][disposalMethod].saved);


      dataColumn += 2;
    });

    row += 1;
  }
}


function writeAllWorkingGroups(sheet, carbonReport) {
  // Write months
  column = 0;
  row = 3;

  carbonReportMonthKeys = Object.keys(carbonReport);

  for (var i = 0; i < carbonReportMonthKeys.length; i++) {

    var monthKey = carbonReportMonthKeys[i];
    var cellAsAlpha = getColumnAsAlpha(column) + row;
    sheet.getRange(cellAsAlpha).setValue(monthKey);

    dataColumn = 1;
    Object.keys(carbonReport[monthKey]["allWorkingGroups"]).forEach(function (disposalMethod) {

      // Write raw data
      cellAsAlpha = getColumnAsAlpha(dataColumn) + row;
      sheet.getRange(cellAsAlpha).setValue(carbonReport[monthKey]["allWorkingGroups"][disposalMethod].raw);

      // Write carbon saved data
      cellAsAlpha = getColumnAsAlpha(dataColumn + 1) + row;
      sheet.getRange(cellAsAlpha).setValue(carbonReport[monthKey]["allWorkingGroups"][disposalMethod].saved);


      dataColumn += 2;
    });

    row += 1;
  }
}

function fetchReportData() {

  // Get api key from script properties
  const scriptProperties = PropertiesService.getScriptProperties();
  var key = scriptProperties.getProperty('API_KEY');

  // Make the api post and parse the response
  var response = UrlFetchApp.fetch(
    "https://murakami.shrubcoop.org/api/post/carbon-accounting/report?key=" + key,
    { "method": "post" }
  );
  response = JSON.parse(response);

  // Check if the request was successful
  if (response.status == "ok") {
    console.log("Successful api response parsed");

    // Wipe the report and remake
    try {
      allWorkingGroupsSheet.clearContents();
      var workingGroups = response.workingGroups;
      var carbonReport = response.carbonReport;
      writeCarbonAccountingReport(workingGroups, carbonReport);
      console.log('Success');
    } catch (e) {
      console.error("Error: ", e);
    }

  } else {
    console.error("Error: " + response.msg);
  }
}