// /carbon-accounting/export

var router = require("express").Router();
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Carbon = require(rootDir + "/app/models/carbon-calculations");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

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

    Carbon.getCategories(function(err, carbonCategories) {
      WorkingGroups.getAll(function(err, working_groups) {
        Carbon.getAllByWorkingGroup(group_id, function(err, raw) {
          formattedData = {};

          Object.keys(carbonCategories).forEach(function(key) {
            formattedData[key] = {};
            formattedData[key] = { raw: 0, saved: 0 };
          });

          for (let i = 0; i < raw.length; i++) {
            if (
              raw[i].trans_date >= startDate &&
              raw[i].trans_date <= endDate &&
              raw[i].method == method
            ) {
              raw[i].trans_object = JSON.parse(raw[i].trans_object);
              Object.keys(raw[i].trans_object).forEach(function(key) {
                formattedData[key].raw += +raw[i].trans_object[key];

                formattedData[key].saved +=
                  +raw[i].trans_object[key] *
                  carbonCategories[key].factors[method];
              });
            }
          }

          Object.keys(formattedData).forEach(function(key) {
            formattedData[key].raw = (
              formattedData[key].raw * unit.factor
            ).toFixed(4);
            formattedData[key].saved = Math.abs(
              formattedData[key].saved * unit.factor
            ).toFixed(4);
          });

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
            dates
          });
        });
      });
    });
  }
);

module.exports = router;
