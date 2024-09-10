// /carbon-accounting/raw-csv-export

const router = require("express").Router();
const lodash = require("lodash");
const ExportToCsv = require("export-to-csv").ExportToCsv;
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

const Models = require(rootDir + "/app/models/sequelize");
const Carbon = Models.Carbon;
const CarbonCategories = Models.CarbonCategories;
const Users = Models.Users;

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("carbonAccounting", "export"),
  async (req, res) => {
    try {
      let formattedCarbon = [];
      const { usersObj } = await Users.getAll(req.user);
      const carbonCategories = await CarbonCategories.getAll();
      const carbon = await Carbon.getAll();

      for await (const transaction of carbon) {
        if (transaction.trans_object) {
          const formattedTransaction = {};

          formattedTransaction["Transaction ID"] = transaction.transaction_id;
          formattedTransaction.Timestamp = transaction.trans_date;
          if (req.user.allWorkingGroupsObj[transaction.group_id]) {
            formattedTransaction["Working Group"] =
              req.user.allWorkingGroupsObj[transaction.group_id].name;
          } else {
            formattedTransaction["Working Group"] = "-";
          }

          if (usersObj[transaction.user_id]) {
            formattedTransaction.User = `${usersObj[transaction.user_id].first_name} ${usersObj[transaction.user_id].last_name}`;
          } else {
            formattedTransaction.User = "Unknown User";
          }

          if (transaction.member_id) {
            formattedTransaction.Member = lodash.startCase(transaction.member_id);
          } else {
            formattedTransaction.Member = null;
          }

          if (transaction.fx_transaction_id) {
            formattedTransaction["Till Transaction ID"] = transaction.fx_transaction_id;
          } else {
            formattedTransaction["Till Transaction ID"] = "";
          }

          formattedTransaction["Disposal Method"] = lodash.startCase(transaction.method);

          for await (const carbonCategoryId of Object.keys(carbonCategories)) {
            const carbonCategory = carbonCategories[carbonCategoryId];
            formattedTransaction[carbonCategory.name] =
              transaction.trans_object[carbonCategoryId] || 0;
          }

          formattedCarbon.push(formattedTransaction);
        }
      }

      formattedCarbon = lodash.sortBy(formattedCarbon, "Timestamp");

      const options = {
        fieldSeparator: ",",
        quoteStrings: '"',
        decimalSeparator: ".",
        showLabels: true,
        showTitle: true,
        title: "Raw Carbon Accounting Data " + moment().format("YYYY-MM-DD"),
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
      };

      const csvExporter = new ExportToCsv(options);

      res.setHeader("Content-disposition", "attachment; filename=" + options.title + ".csv");
      res.set("Content-Type", "text/csv");
      res.status(200).send(csvExporter.generateCsv(formattedCarbon, true));
    } catch (error) {
      console.log(error);
      req.flash("error_msg", "Something went wrong! Please try again");
      res.redirect(process.env.PUBLIC_ADDRESS + "/carbon-accounting/export");
    }
  }
);

module.exports = router;
