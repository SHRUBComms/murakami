const router = require("express").Router();
const fs = require("fs");
const path = require("path");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const sequelize = Models.sequelize;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewReports"), async (req, res) => {
  try {
    const datePeriod = req.body.datePeriod || "today";
    const startDateRaw = req.body.startDate || null;
    const endDateRaw = req.body.endDate || null;

    const { formattedStartDate, formattedEndDate } = await Helpers.plainEnglishDateRangeToDates(
      datePeriod,
      startDateRaw,
      endDateRaw
    );

    // Read the SQL query from the file
    const sqlFilePath = path.join(
      rootDir,
      "app/routes/api/post/tills/reports/sumup-reconciliation.sql"
    );
    let sqlQuery = fs.readFileSync(sqlFilePath, "utf8");

    // Add date range filter to the SQL query for both parts of the UNION
    sqlQuery = sqlQuery.replace(
      "WHERE \n    JSON_EXTRACT(t.summary, '$.sumupId') IS NOT NULL",
      "WHERE \n    JSON_EXTRACT(t.summary, '$.sumupId') IS NOT NULL\n    AND t.date BETWEEN :startDate AND :endDate"
    );

    // Add date filter to the second part of the UNION (for SUMUP transactions)
    sqlQuery = sqlQuery.replace(
      "WHERE \n    JSON_EXTRACT(t.summary, '$.sumupId') IS NULL\n    AND st.status IN ('SUCCESSFUL', 'PENDING')",
      "WHERE \n    JSON_EXTRACT(t.summary, '$.sumupId') IS NULL\n    AND st.status IN ('SUCCESSFUL', 'PENDING')\n    AND st.timestamp BETWEEN :startDate AND :endDate"
    );

    // Execute the query with parameters
    const reconciliationData = await sequelize.query(sqlQuery, {
      replacements: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    // Format the data for display in the table
    const formattedData = reconciliationData.map((item) => ({
      timestamp: item.Date,
      timestamp_sumup: item["SumUp Timestamp"],
      transaction_id: item["Transaction ID"],
      sumup_id: item["SUMUP ID"],
      murakami_amount: item["Murakami Amount"],
      sumup_amount: item["SUMUP Amount"],
      sumup_status: item["SumUp Status"],
      status: item.Status,
    }));

    res.send(formattedData);
  } catch (error) {
    console.error("Error in SUMUP reconciliation report:", error);
    res.send([]);
  }
});

module.exports = router;
