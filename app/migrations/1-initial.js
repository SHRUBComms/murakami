require("dotenv").config();
const fs = require("fs");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return new Promise((resolve, reject) => {
      fs.readFile(process.env.CWD + "/resources/initial.sql", function (err, data) {
        if (err) throw err;
        resolve(data.toString());
      });
    }).then((initialSchema) => {
      // need to split on ';' to get the individual CREATE TABLE sql
      // as db.query can execute on query at a time
      const tables = initialSchema.split(";\n");

      tables.forEach(function createTable(tableSql) {
        queryInterface.sequelize.query(tableSql).catch((reason) => {
          console.log(tableSql);
        });
      });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.showAllTables().then((tableNames) => {
      // Dont drop the SequelizeMeta table
      const tables = tableNames.filter(function (name) {
        return name.toLowerCase() !== "sequelizemeta";
      });

      tables.forEach(function (tableName) {
        queryInterface.dropTable(tableName);
      });
    });
  },
};
