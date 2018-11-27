// /reports/carbon

var router = require("express").Router();
var moment = require("moment");

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Carbon = require(rootDir + "/app/models/carbon-calculations");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  var startDate = req.query.startDate || new Date();
  var endDate = req.query.endDate || new Date();
  var unit = req.query.unit;
  var type = req.query.type;
  var group_id = req.query.group_id;
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
          formattedData[key] = 0;
        });

        for (let i = 0; i < raw.length; i++) {
          if (
            raw[i].trans_date >= startDate &&
            raw[i].trans_date <= endDate &&
            raw[i].method == method
          ) {
            raw[i].trans_object = JSON.parse(raw[i].trans_object);
            Object.keys(raw[i].trans_object).forEach(function(key) {
              formattedData[key] =
                formattedData[key] + +raw[i].trans_object[key];
            });
          }
        }

        Object.keys(formattedData).forEach(function(key) {
          console.log(
            formattedData[key],
            carbonCategories[key][method],
            unit.factor
          );
          formattedData[key] = (formattedData[key] * unit.factor).toFixed(4);
        });

        var dates = { start: null, end: null };
        console.log(startDate);
        dates.start = moment(startDate).format("DD/MM/YY");
        dates.end = moment(endDate).format("DD/MM/YY");

        try {
          startDate = startDate.toISOString().split("T")[0];
        } catch (err) {
          startDate = null;
        }
        endDate = endDate.toISOString().split("T")[0] || null;

        res.render("reports/carbon", {
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
});

module.exports = router;
