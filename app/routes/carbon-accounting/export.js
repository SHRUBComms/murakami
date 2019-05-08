// /carbon-accounting/export

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Models = require(rootDir + "/app/models/sequelize");
var Carbon = Models.Carbon;
var CarbonCategories = Models.CarbonCategories;
var WorkingGroups = Models.WorkingGroups;

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("carbonAccounting", "export"),
  function(req, res) {
    try {
      var startDate = new Date(req.query.startDate) || new Date();
    } catch (err) {
      var startDate = new Date();
    }

    try {
      var endDate = new Date(req.query.endDate) || new Date();
    } catch (err) {
      var endDate = new Date();
    }

    var unit = req.query.unit;
    var type = req.query.type;
    var group_id;

    if (
      req.user.permissions.carbonAccounting.export == true ||
      (req.user.permissions.carbonAccounting.export == "commonWorkingGroup" &&
        req.user.working_groups.includes(req.query.group_id))
    ) {
      group_id = req.query.group_id;
    }

    var method = req.query.method;

    if (unit == "grams") {
      unit = { factor: 1, name: "grams" };
    } else if (unit == "tonnes") {
      unit = { factor: 1e-6, name: "tonnes" };
    } else {
      unit = { factor: 1e-3, name: "kilos" };
    }

    CarbonCategories.getAll(function(err, carbonCategories) {
      WorkingGroups.getAll(function(err, working_groups) {
        Carbon.getAllByWorkingGroupBetweenTwoDates(
          group_id,
          startDate,
          endDate,
          function(err, rawCarbon) {
            formattedData = {};
            async.each(
              carbonCategories,
              function(category, callback) {
                formattedData[category.carbon_id] = { raw: 0, saved: 0 };
                callback();
              },
              function() {
                async.each(
                  rawCarbon,
                  function(transaction, callback) {
                    if (transaction.method == method) {
                      transaction.trans_object = JSON.parse(
                        transaction.trans_object
                      );
                      async.eachOf(
                        transaction.trans_object,
                        function(amount, itemId, callback) {
                          console.log(itemId);
                          formattedData[itemId].raw += amount;

                          formattedData[itemId].saved +=
                            +transaction.trans_object[itemId] *
                            carbonCategories[itemId].factors[method];
                          callback();
                        },
                        function() {
                          callback();
                        }
                      );
                    } else {
                      callback();
                    }
                  },
                  function() {
                    console.log(formattedData);
                    async.each(
                      formattedData,
                      function(carbon, callback) {
                        carbon.raw = (carbon.raw * unit.factor).toFixed(4);
                        carbon.saved = Math.abs(
                          carbon.saved * unit.factor
                        ).toFixed(4);
                        callback();
                      },
                      function() {
                        var dates = { start: null, end: null };

                        dates.start = moment(startDate).format("DD/MM/YY");
                        dates.end = moment(endDate).format("DD/MM/YY");

                        try {
                          startDate = startDate.toISOString().split("T")[0];
                        } catch (err) {
                          startDate = null;
                        }
                        try {
                          endDate = endDate.toISOString().split("T")[0] || null;
                        } catch (err) {
                          endDate = null;
                        }

                        res.render("carbon-accounting/export", {
                          carbonActive: true,
                          title: "Carbon Report",
                          carbon: formattedData,
                          type: type,
                          unit: unit,
                          startDate: startDate,
                          endDate: endDate,
                          carbonCategories: carbonCategories,
                          working_groups: working_groups,
                          group_id: group_id,
                          method: method,
                          dates: dates
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  }
);

module.exports = router;
