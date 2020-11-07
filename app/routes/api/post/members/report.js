// /api/post/members/report

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const WorkingGroups = Models.WorkingGroups;
const Reports = Models.Reports;

const Auth = require(rootDir + "/app/controllers/auth");

router.post("/", Auth.verifyByKey("membershipReport"), async (req, res) => {
  try {
    const { allWorkingGroupsObj } = await WorkingGroups.getAll();
    let summary = {};

    const reports = await Reports.getAll();
    
    for await (const report of reports) {
      summary[report.date] = report;
    }

    res.send({ status: "ok", summary: summary, workingGroups: allWorkingGroupsObj });
  } catch (error) {
    res.send({ status: "fail", summary: {}, workingGroups: {} });
  }
});

module.exports = router;
