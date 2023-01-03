// /api/post/carbon-accounting/report

const router = require("express").Router();

const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const WorkingGroups = Models.WorkingGroups;
const Carbon = Models.Carbon;
const CarbonCategories = Models.CarbonCategories;

const Auth = require(rootDir + "/app/controllers/auth");

router.post("/", Auth.verifyByKey("carbonAccountingReport"), async (req, res) => {
  try {
    const { allWorkingGroupsObj } = await WorkingGroups.getAll();

    const rawCarbon = await Carbon.getAll();
    const carbonCategories = await CarbonCategories.getAll();
    
    const earliestDate = moment(rawCarbon[0].trans_date).startOf("month"); 

    const noOfMonths = Math.ceil(moment().endOf("month").diff(earliestDate, "months", true));

    let carbonReport = {};
    
    let formattedData = {
        recycled: { raw: 0, saved: 0 },
        generated: { raw: 0, saved: 0 },
        incinerated: { raw: 0, saved: 0 },
        landfilled: { raw: 0, saved: 0 },
        composted: { raw: 0, saved: 0 },
        reused: { raw: 0, saved: 0 },
        ["reuse-partners"]: { raw: 0, saved: 0 },
        stored: { raw: 0, saved: 0 },
        other: { raw: 0, saved: 0 }
    };

    // Setup data object with key for each month.
    let month = 0;
    for await (const i of new Array(noOfMonths)) {
      const monthKey = moment(earliestDate).add(month, "months").format("YYYY-MM-DD");
      carbonReport[monthKey] = { allWorkingGroups: formattedData, byWorkingGroup: {} };
      for await (const workingGroup of Object.keys(allWorkingGroupsObj)) {
        carbonReport[monthKey]["byWorkingGroup"][workingGroup] = formattedData;
      }
      month += 1;
    }


    for await (let transaction of rawCarbon) {  
	    if(!transaction.trans_object) {
	      continue;
	    }
      
      const monthKey = moment(transaction.trans_date).startOf("month").format("YYYY-MM-DD");
      const workingGroup = transaction.group_id;

      for await (const carbonCategoryId of Object.keys(transaction.trans_object)) {
        let amount = transaction.trans_object[carbonCategoryId];

        if(isNaN(amount)) {
          continue;
        }

        amount = Number(amount);
        // Store raw weight
        const rawAmount = amount;
        // Store how much carbon saved, convert to kg.
        const carbonSaved = +transaction.trans_object[carbonCategoryId] * +carbonCategories[carbonCategoryId].factors[transaction.method] * 1e-3;

        // Grand totals
        carbonReport[monthKey]["allWorkingGroups"][transaction.method].raw += +rawAmount;
        carbonReport[monthKey]["allWorkingGroups"][transaction.method].saved += carbonSaved;

        // By working group 
        carbonReport[monthKey]["byWorkingGroup"][workingGroup][transaction.method].raw += +(rawAmount).toFixed(4);
        carbonReport[monthKey]["byWorkingGroup"][workingGroup][transaction.method].saved += +(carbonSaved).toFixed(4);
      }
    }

    res.send({ status: "ok",  carbonReport, workingGroups: allWorkingGroupsObj });
  } catch (error) {
    res.send({ status: "fail", carbonReport: {}, workingGroups: {} });
  }
});

module.exports = router;
