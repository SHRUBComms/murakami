// /api/post/tills/reports/stock-records

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Users = Models.Users;
const StockCategories = Models.StockCategories;
const StockRecords = Models.StockRecords;

const Auth = require(rootDir + "/app/configs/auth");
const Helpers = require(rootDir + "/app/helper-functions/root");

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
    
    const { formattedStartDate, formattedEndDate } = await Helpers.plainEnglishDateRangeToDates(datePeriod, startDateRaw, endDateRaw);
    
    const records = await StockRecords.getAllBetweenTwoDatesByTillId(till_id, formattedStartDate, formattedEndDate);
    const { usersObj } = await Users.getAll(req.user);
    
    const categories = await StockCategories.getCategories("treeKv");
    const formattedRecords = await StockRecords.formatRecords(records, usersObj, categories, req.user.allWorkingGroupsObj);
    res.send(formattedRecords);
  } catch (error) {
    res.send([]);
  }
});

module.exports = router;
