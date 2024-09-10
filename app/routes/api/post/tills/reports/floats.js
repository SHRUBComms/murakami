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

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewReports"), async (req, res) => {
  try {
    const till_id = req.body.till_id;
    const datePeriod = req.body.datePeriod || "today";

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
    const { usersObj } = await Users.getAll(req.user);

    const formattedActivity = [];

    for await (const action of activity) {
      const formattedAction = {};

      formattedAction.timestamp = moment(action.timestamp).format("L hh:mm A");

      if (action.opening == 1) {
        formattedAction.action = "Opening";

        formattedAction.summary = "Counted Float: £" + action.counted_float.toFixed(2);

        formattedAction.discrepancy = "-";
      } else {
        formattedAction.action = "Closing";
        formattedAction.summary = "Counted Float: £" + action.counted_float.toFixed(2);
        formattedAction.summary += "<br />";
        formattedAction.summary += "Expected Float: £" + action.expected_float.toFixed(2);

        const discrepancy = (action.counted_float - action.expected_float).toFixed(2);

        if (discrepancy >= 0) {
          formattedAction.discrepancy = "£" + discrepancy;
        } else {
          formattedAction.discrepancy = "-£" + Math.abs(discrepancy).toFixed(2);
        }
      }

      if (action.note) {
        formattedAction.note = action.note;
      } else {
        formattedAction.note = "-";
      }

      if (usersObj[action.user_id]) {
        formattedAction.user = usersObj[action.user_id].name;
      } else {
        formattedAction.user = "Unknown User";
      }

      formattedActivity.push(formattedAction);
    }

    res.send(formattedActivity);
  } catch (error) {
    res.send([]);
  }
});

module.exports = router;
