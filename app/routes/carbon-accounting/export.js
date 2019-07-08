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
    var startDate, endDate;
    try {
      startDate = moment(req.query.startDate)
        .startOf("day")
        .toDate();
    } catch (err) {
      startDate = moment()
        .startOf("day")
        .toDate();
    }

    try {
      endDate = moment(req.query.endDate)
        .endOf("day")
        .toDate();
    } catch (err) {
      endDate = moment()
        .endOf("day")
        .toDate();
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

    if (
      group_id == "all-working-groups" &&
      req.user.permissions.carbonAccounting.export != true
    ) {
      group_id = null;
    }

    var method = req.query.method || null;

    if (unit == "grams") {
      unit = { factor: 1, name: "grams" };
    } else if (unit == "tonnes") {
      unit = { factor: 1e-6, name: "tonnes" };
    } else {
      unit = { factor: 1e-3, name: "kilos" };
    }

    var invalidRequest = true;

    if (startDate && endDate && unit && group_id && method) {
      invalidRequest = false;
    }

    CarbonCategories.getAll(function(err, carbonCategories) {
      WorkingGroups.getAll(function(err, working_groups) {
        Carbon.getAllBetweenTwoDates(startDate, endDate, function(
          err,
          rawCarbon
        ) {
          formattedData = {
            recycled: {},
            generated: {},
            incinerated: {},
            landfilled: {},
            composted: {},
            reused: {},
            stored: {},
            other: {},
            totals: { raw: 0, saved: 0 }
          };
          async.each(
            carbonCategories,
            function(category, callback) {
              if (!invalidRequest) {
                if (method == "grand-totals") {
                  async.each(
                    Object.keys(formattedData),
                    function(methodName, callback) {
                      if (methodName != "totals") {
                        formattedData[methodName].totals = { raw: 0, saved: 0 };
                        formattedData[methodName][category.carbon_id] = {
                          raw: 0,
                          saved: 0
                        };
                      }

                      callback();
                    },
                    function() {
                      callback();
                    }
                  );
                } else {
                  formattedData[method].totals = { raw: 0, saved: 0 };
                  formattedData[method][category.carbon_id] = {
                    raw: 0,
                    saved: 0
                  };
                  callback();
                }
              } else {
                callback();
              }
            },
            function() {
              async.each(
                rawCarbon,
                function(transaction, callback) {
                  if (!invalidRequest) {
                    if (
                      transaction.method == method ||
                      method == "grand-totals"
                    ) {
                      if (
                        transaction.group_id == group_id ||
                        group_id == "all-working-groups"
                      ) {
                        if (
                          typeof transaction.trans_object === "string" ||
                          transaction.trans_object instanceof String
                        ) {
                          transaction.trans_object = JSON.parse(
                            transaction.trans_object
                          );
                        }

                        async.eachOf(
                          transaction.trans_object,
                          function(amount, itemId, callback) {
                            formattedData[transaction.method][
                              itemId
                            ].raw += +amount;
                            formattedData[
                              transaction.method
                            ].totals.raw += +amount;
                            formattedData.totals.raw += +amount;

                            formattedData[transaction.method][itemId].saved +=
                              +transaction.trans_object[itemId] *
                              +carbonCategories[itemId].factors[
                                transaction.method
                              ];
                            formattedData[transaction.method].totals.saved +=
                              +transaction.trans_object[itemId] *
                              +carbonCategories[itemId].factors[
                                transaction.method
                              ];
                            formattedData.totals.saved +=
                              +transaction.trans_object[itemId] *
                              +carbonCategories[itemId].factors[
                                transaction.method
                              ];

                            callback();
                          },
                          function() {
                            callback();
                          }
                        );
                      } else {
                        callback();
                      }
                    } else {
                      callback();
                    }
                  } else {
                    callback();
                  }
                },
                function() {
                  formattedData.totals.raw = (
                    formattedData.totals.raw * unit.factor
                  ).toFixed(4);
                  formattedData.totals.saved = (
                    formattedData.totals.saved * unit.factor
                  ).toFixed(4);
                  async.each(
                    formattedData,
                    function(methodData, callback) {
                      if (!invalidRequest) {
                        async.each(
                          methodData,
                          function(carbon, callback) {
                            carbon.raw = (carbon.raw * unit.factor).toFixed(4);
                            carbon.saved = (carbon.saved * unit.factor).toFixed(
                              4
                            );

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
                      var dates = {};

                      dates.start =
                        moment(startDate).format("YYYY-MM-DD") || null;
                      dates.end = moment(endDate).format("YYYY-MM-DD") || null;

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
                        dates: dates,
                        invalidRequest: invalidRequest
                      });
                    }
                  );
                }
              );
            }
          );
        });
      });
    });
  }
);

module.exports = router;
