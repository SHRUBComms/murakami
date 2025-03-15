// /api/post/tills/reports/transactions-by-weekday-by-hour

const router = require("express").Router();

const moment = require("moment");

moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Auth = require(rootDir + "/app/controllers/auth");

router.post("/", Auth.verifyByKey("footfallReport"), async (req, res) => {
  try {
    const { startDate, endDate, tillName } = req.query;

    if (!startDate || !endDate || !tillName) {
      return res.status(400).send({ status: "fail", message: "Missing required parameters" });
    }

    const formattedStartDate = moment(startDate).format("YYYY-MM-DD");
    const formattedEndDate = moment(endDate).format("YYYY-MM-DD");

    const sqlQuery = `
      SELECT      transaction_weekday
          ,       transaction_hour
          ,       COUNT(*) AS total_quantity
          ,       SUM(transaction_value) AS total_value
      FROM        murakami.vw_transactions
      WHERE       transaction_date BETWEEN ? AND ?
      AND         till_name = ?
      GROUP BY    transaction_weekday
          ,       transaction_hour;
    `;

    const results = await Models.sequelize.query(sqlQuery, {
      replacements: [formattedStartDate, formattedEndDate, tillName],
      type: Models.sequelize.QueryTypes.SELECT,
    });

    res.send({ status: "ok", data: results });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "fail", message: "Internal server error", data: [] });
  }
});

module.exports = router;
