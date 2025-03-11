// /api/post/tills/reports/transactions-by-weekday-by-hour

const router = require("express").Router();

const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Auth = require(rootDir + "/app/controllers/auth");

router.post("/", Auth.verifyByKey("transactionsByWeekdayByHourReport"), async (req, res) =>
{
  try
  {
    const {startDate, endDate, tillName, weekdayNumber} = req.query;

    const sqlQuery = `
      SELECT      SUM(IF(HOUR(tr.\`date\`) BETWEEN 0 AND 10, 1, 0)) AS \`Before 11am\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 11, 1, 0)) AS \`11am-12pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 12, 1, 0)) AS \`12pm-1pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 13, 1, 0)) AS \`1pm-2pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 14, 1, 0)) AS \`2pm-3pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 15, 1, 0)) AS \`3pm-4pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 16, 1, 0)) AS \`4pm-5pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) = 17, 1, 0)) AS \`5pm-6pm\`
          ,       SUM(IF(HOUR(tr.\`date\`) BETWEEN 18 AND 23, 1, 0)) AS \`6pm Onwards\`
      FROM        murakami_local.transactions tr
      INNER JOIN  murakami_local.tills ti
      ON          ti.till_id = tr.till_id
      WHERE       tr.\`date\` BETWEEN '${startDate}' AND '${endDate}'
      AND         ti.\`name\` = '${tillName}'
      AND         WEEKDAY(tr.\`date\`) = ${weekdayNumber};
    `;

    const results = await Models.sequelize.query(
      sqlQuery,
      {type: Models.sequelize.QueryTypes.SELECT}
    );

    res.send({status: "ok", data: results});
  }
  catch (error)
  {
    console.error(error);
    res.send({status: "fail", data: []});
  }
});

module.exports = router;
