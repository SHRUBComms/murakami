// /api/post/tills/reports/floats

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Users = Models.Users;
const TillActivity = Models.TillActivity;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");
const { convertTillActivityToFloatsReport } = require("./handlers");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewReports"), async (req, res) => {
  try {
    const till_id = req.body.till_id;
    const datePeriod = req.body.datePeriod || "today";
    const user = req.user;

    const startDateRaw = req.body.startDate || null;
    const endDateRaw = req.body.endDate || null;

    if (!till_id) {
      throw "No till specified";
    }

    const till = await Tills.getById(till_id);

    if (!till) {
      throw "Till not found";
    }

    const { formattedStartDate, formattedEndDate } = await Helpers.plainEnglishDateRangeToDates(
      datePeriod,
      startDateRaw,
      endDateRaw
    );
    const activity = await TillActivity.getAllActivityBetweenTwoDatesByTillId(
      till_id,
      formattedStartDate,
      formattedEndDate
    );
    const { usersObj } = await Users.getAll(user);
    const formattedActivity = await convertTillActivityToFloatsReport({
      activity,
      usersObj,
    });
    res.send(formattedActivity);
  } catch (error) {
    res.send([]);
  }
});

module.exports = router;
