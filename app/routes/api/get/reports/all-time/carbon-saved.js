// /api/get/reports/all-time/carbon-saved

const router = require("express").Router();

const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Carbon = Models.Carbon;
const CarbonCategories = Models.CarbonCategories;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");
const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.verifyByKey("carbonSavings"), async (req, res) => {
  try {
    let startDate = moment("1970-01-01").toDate();

    if(process.env.CARBON_OFFSET_DATE){
      startDate = moment(process.env.CARBON_OFFSET_DATE).toDate();
    }

    const carbon = await Carbon.getAllBetweenTwoDates(startDate, moment().toDate());
    if(carbon.length == 0) {
      throw "No carbon savngs";
    }
  
    const carbonCategories = await CarbonCategories.getAll();
    let totalCarbon = await Helpers.calculateCarbon(carbon, carbonCategories);
    totalCarbon = Math.abs(totalCarbon * 1e-6); // To metric tons
    
    if (process.env.CARBON_OFFSET) {
      totalCarbon = totalCarbon + Number(process.env.CARBON_OFFSET);
    }
    
    res.send(totalCarbon.toFixed(3));
  
  } catch (error) {
    const totalCarbon = 0;
    res.send(totalCarbon.toFixed(3));
  }
});

module.exports = router;
