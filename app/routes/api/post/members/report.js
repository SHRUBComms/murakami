// /api/post/members/report

var router = require("express").Router();

var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var WorkingGroups = Models.WorkingGroups;
var Reports = Models.Reports;

var Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.verifyByKey("membershipReport"), function(req, res) {
  WorkingGroups.getAll(function(
    err,
    allWorkingGroupsObj,
    allWorkingGroupsRaw,
    allWorkingGroupsArray
  ) {
    var response = {
      status: "fail",
      msg: "Something went wrong!",
      summary: {},
      workingGroups: allWorkingGroupsObj
    };

    Reports.getAll(function(err, reports) {
    	try {
		if(err) throw err;
		async.forEach(reports, function(report, callback) {
		      response.summary[report.date] = report;
		      callback();
		}, function() {
        		response.status = "ok";
			delete response.msg;
			res.send(response);
		});
	} catch(error) {
		res.send(response);
	}
    });
  });
});

module.exports = router;
