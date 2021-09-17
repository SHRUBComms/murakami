// /carbon-accounting/export

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

const Models = require(rootDir + "/app/models/sequelize");
const Carbon = Models.Carbon;
const CarbonCategories = Models.CarbonCategories;

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("carbonAccounting", "export"), async (req, res) => {
  try {
    let startDate, endDate;
    
    try {
      startDate = moment(req.query.startDate).startOf("day").toDate();
    } catch (error) {
      startDate = moment().startOf("day").toDate();
    }

    try {
      endDate = moment(req.query.endDate).endOf("day").toDate();
    } catch (error) {
      endDate = moment().endOf("day").toDate();
    }

    let unit = req.query.unit;
    let type = req.query.type;
    let group_id = req.query.group_id;

    if (!(req.user.permissions.carbonAccounting.export == true || (req.user.permissions.carbonAccounting.export == "commonWorkingGroup" && req.user.working_groups.includes(req.query.group_id)))) {
      throw "You're not permitted to export carbon accountng records";
    }

    if (group_id == "all-working-groups" && req.user.permissions.carbonAccounting.export != true) {
      group_id = null;
    }
    
    let method = req.query.method || null;

    if (unit == "grams") {
      unit = { factor: 1, name: "grams" };
    } else if (unit == "tonnes") {
      unit = { factor: 1e-6, name: "tonnes" };
    } else {
      unit = { factor: 1e-3, name: "kilos" };
    }

    let invalidRequest = true;
    
    if (startDate && endDate && unit && group_id && method) {
      invalidRequest = false;
    }
    
    const carbonCategories = await CarbonCategories.getAll();
    const rawCarbon = await Carbon.getAllBetweenTwoDates(startDate, endDate);

    let formattedData = {
        recycled: {},
        generated: {},
        incinerated: {},
        landfilled: {},
        composted: {},
        reused: {},
        ["reuse-partners"]: {},
        stored: {},
        other: {},
        totals: {
            raw: 0,
            saved: 0
        }
    };

    if(!invalidRequest) {

      for await (const carbonCategoryId of Object.keys(carbonCategories)) {
      
        const category = carbonCategories[carbonCategoryId];

        if (method == "grand-totals") {
          for await (const methodName of Object.keys(formattedData)) {
            if (methodName != "totals") {
                formattedData[methodName].totals = { raw: 0, saved: 0 };
                formattedData[methodName][category.carbon_id] = { raw: 0, saved: 0 };
            }
          }
        } else {
          formattedData[method].totals = { raw: 0, saved: 0 };

          formattedData[method][category.carbon_id] = { raw: 0, saved: 0 };
        }
      }

      
      for await (let transaction of rawCarbon) {

        if (!(transaction.method == method || method == "grand-totals")) {
          continue;
        }
        
        if (!(transaction.group_id == group_id || group_id == "all-working-groups")) {
          continue;
        }
       
	if(!transaction.trans_object) {
	  continue;
	}
 
        for await (const carbonCategoryId of Object.keys(transaction.trans_object)) {
          let amount = transaction.trans_object[carbonCategoryId];

          if(!formattedData[transaction.method][carbonCategoryId]) {
            continue;
          }

          if(isNaN(amount)) {
            continue;
          }

          amount = Number(amount);

          formattedData[transaction.method][carbonCategoryId].raw += +amount;
          formattedData[transaction.method].totals.raw += +amount;
          formattedData.totals.raw += +amount;

          formattedData[transaction.method][carbonCategoryId].saved += +transaction.trans_object[carbonCategoryId] * +carbonCategories[carbonCategoryId].factors[transaction.method];
          formattedData[transaction.method].totals.saved += +transaction.trans_object[carbonCategoryId] * +carbonCategories[carbonCategoryId].factors[transaction.method];
          formattedData.totals.saved += +transaction.trans_object[carbonCategoryId] * +carbonCategories[carbonCategoryId].factors[transaction.method];
        }
      }

      for await (const disposalMethod of Object.keys(formattedData)) {
        if(formattedData[disposalMethod].raw) {
	  formattedData[disposalMethod].raw = (formattedData[disposalMethod].raw * unit.factor).toFixed(4);
          formattedData[disposalMethod].saved = (formattedData[disposalMethod].saved * unit.factor).toFixed(4);
        } else {
	    for await (const carbonId of Object.keys(formattedData[disposalMethod])) {
	      if(formattedData[disposalMethod][carbonId]) {
	        formattedData[disposalMethod][carbonId].raw = (formattedData[disposalMethod][carbonId].raw * unit.factor).toFixed(4);
                formattedData[disposalMethod][carbonId].saved = (formattedData[disposalMethod][carbonId].saved * unit.factor).toFixed(4);
	      }
	    }
	  
	}
      }
    }

    let dates = {};

    dates.start = moment(startDate).format("YYYY-MM-DD") || null;
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
        working_groups: req.user.allWorkingGroupsObj,
        group_id: group_id,
        method: method,
        dates: dates,
        invalidRequest: invalidRequest
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

module.exports = router;
