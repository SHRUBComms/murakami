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
      SELECT      WEEKDAY(tr.\`date\`) AS \`Weekday\`
          ,       SUM(IF(HOUR(tr.\`date\`) BETWEEN 0 AND 10, 1, 0)) AS \`Before 11am\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 11, 1, 0)) AS \`11am-12pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 12, 1, 0)) AS \`12pm-1pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 13, 1, 0)) AS \`1pm-2pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 14, 1, 0)) AS \`2pm-3pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 15, 1, 0)) AS \`3pm-4pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 16, 1, 0)) AS \`4pm-5pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 17, 1, 0)) AS \`5pm-6pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) BETWEEN 18 AND 23, 1, 0)) AS \`6pm Onwards\`
      FROM        murakami.transactions tr
      INNER JOIN  murakami.tills ti
      ON          ti.till_id = tr.till_id
      WHERE       tr.\`date\` BETWEEN ? AND ?
      AND         ti.\`name\` = ?
      GROUP BY    WEEKDAY(tr.\`date\`);
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
