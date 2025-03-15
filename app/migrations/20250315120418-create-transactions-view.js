module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.sequelize.query(`
      CREATE VIEW vw_transactions AS
      SELECT      tr.\`date\` AS 'transaction_date'
          ,       CASE
                      WHEN JSON_EXTRACT(summary, '$.refunded') IS NOT NULL
                      OR JSON_EXTRACT(summary, '$.refundedTransactionId') IS NOT NULL
                          THEN -CAST(JSON_EXTRACT(JSON_EXTRACT(summary, '$.totals'), '$.money') AS DECIMAL(8, 2))
                      WHEN JSON_EXTRACT(JSON_EXTRACT(summary, '$.totals'), '$.money') IS NULL
                          THEN 0.00
                      ELSE
                          CAST(JSON_EXTRACT(JSON_EXTRACT(summary, '$.totals'), '$.money') AS DECIMAL(8, 2))
                  END AS transaction_value
          ,       ti.\`name\` AS 'till_name'
          ,       WEEKDAY(tr.\`date\`) AS 'transaction_weekday'
          ,       CASE
                      WHEN HOUR(tr.\`date\`) BETWEEN 0 AND 10 THEN 'Before 11am'
                      WHEN HOUR(tr.\`date\`) = 11 THEN '11am-12pm'
                      WHEN HOUR(tr.\`date\`) = 12 THEN '12pm-1pm'
                      WHEN HOUR(tr.\`date\`) = 13 THEN '1pm-2pm'
                      WHEN HOUR(tr.\`date\`) = 14 THEN '2pm-3pm'
                      WHEN HOUR(tr.\`date\`) = 15 THEN '3pm-4pm'
                      WHEN HOUR(tr.\`date\`) = 16 THEN '4pm-5pm'
                      WHEN HOUR(tr.\`date\`) = 17 THEN '5pm-6pm'
                      WHEN HOUR(tr.\`date\`) BETWEEN 18 AND 23 THEN '6pm Onwards'
                  END AS 'transaction_hour'
      FROM        murakami.transactions tr
      INNER JOIN  murakami.tills ti
      ON          ti.till_id = tr.till_id;
    `);
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.query(`
      DROP VIEW IF EXISTS vw_transactions;
    `);
  },
};
