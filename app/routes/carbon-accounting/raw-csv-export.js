// /carbon-accounting/raw-csv-export

var router = require("express").Router();
var async = require("async");
var lodash = require("lodash");
var ExportToCsv = require("export-to-csv").ExportToCsv;

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Models = require(rootDir + "/app/models/sequelize");
var Carbon = Models.Carbon;
var CarbonCategories = Models.CarbonCategories;
var Users = Models.Users;

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("carbonAccounting", "export"),
  function(req, res) {
    var data = [];
    Users.getAll(req.user, function(err, user, allUsersObj) {
      CarbonCategories.getAll(function(err, categories) {
        Carbon.getAll(function(err, carbon) {
          async.each(
            carbon,
            function(transaction, callback) {
              var formattedTransaction = {};

              formattedTransaction["Transaction ID"] =
                transaction.transaction_id;

              formattedTransaction.Timestamp = transaction.trans_date;

              formattedTransaction["Working Group"] =
                req.user.allWorkingGroupsObj[transaction.group_id].name;

              if (allUsersObj[transaction.user_id]) {
                formattedTransaction.User =
                  allUsersObj[transaction.user_id].first_name +
                  " " +
                  allUsersObj[transaction.user_id].last_name;
              } else {
                formattedTransaction.User = "Unknown User";
              }

              if (transaction.member_id) {
                formattedTransaction.Member = lodash.startCase(
                  transaction.member_id
                );
              } else {
                formattedTransaction.Member = null;
              }

              if (transaction.fx_transaction_id) {
                formattedTransaction["Till Transaction ID"] =
                  transaction.fx_transaction_id;
              } else {
                formattedTransaction["Till Transaction ID"] = null;
              }

              formattedTransaction["Disposal Method"] = lodash.startCase(
                transaction.method
              );

              async.each(
                categories,
                function(category, callback) {
                  formattedTransaction[category.name] =
                    transaction.trans_object[category.carbon_id] || 0;
                  callback();
                },
                function() {
                  data.push(formattedTransaction);
                  callback();
                }
              );
            },
            function() {
              var options = {
                fieldSeparator: ",",
                quoteStrings: '"',
                decimalSeparator: ".",
                showLabels: true,
                showTitle: true,
                title: "Raw Carbon Accounting Data",
                useTextFile: false,
                useBom: true,
                useKeysAsHeaders: true
                // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
              };

              var csvExporter = new ExportToCsv(options);

              res.setHeader('Content-disposition', 'attachment; filename=' + options.title + '.csv');
              res.set('Content-Type', 'text/csv');
              res.status(200).send(csvExporter.generateCsv(data, true));

            }
          );
        });
      });
    });
  }
);

module.exports = router;
