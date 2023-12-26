// /api/post/tills/stock/levels/update

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const StockCategories = Models.StockCategories;
const StockRecords = Models.StockRecords;

const Auth = require(rootDir + "/app/controllers/auth");

router.post("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "manageStock"), async (req, res) => {
  try {

    const summary = req.body.summary;
    const note = req.body.note;

    let sanitizedSummary = {};

    const till = await Tills.getById(req.params.till_id);

    if (!(req.user.permissions.tills.manageStock == true || (req.user.permissions.tills.manageStock == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You don't have permission to update stock levels on this till";
    }

    if (!summary) {
      throw "Please ";
    }
        
    if (!till) {
      throw "Till not found";
    }

    if(till.disabled == 1) {
      throw "Till is disabled";
    }
    
    const categories = await StockCategories.getCategoriesByTillId(req.params.till_id, "kv");
    
    for await (const categoryId of Object.keys(summary)) {
      const category = categories[categoryId];

      if(!category) {
        continue;
      }

      if (category.conditions.length == 0) {
        continue;
      }

      if(!category.active) {
        continue;
      }

      if(!category.stockControl) {
        continue;
      }

      if(!category.stockInfo) {
        continue;
      }

      sanitizedSummary[categoryId] = {};

      for await (const condition of Object.keys(summary[categoryId])) {
        
        if(!category.conditions.includes(condition)) {
          continue;
        }

        const subcategory = summary[categoryId][condition];
        
        let quantity = 0;
        if (Number.isInteger(Number(subcategory.qtyModifier))) {
          quantity = subcategory.qtyModifier;
        } else {
          quantity = 0;
        }

        if (quantity != 0) {
          let oldQty = 0;
          if (categories[categoryId].stockInfo[condition]) {
            oldQty = categories[categoryId].stockInfo[condition].quantity;
          }

          sanitizedSummary[categoryId][condition] = { oldQty: oldQty, qtyModifier: quantity, newQty: Number(oldQty) + Number(quantity) };
        }
      }
    }

    for await (const categoryId of Object.keys(sanitizedSummary)) {
      let newStockInfo = categories[categoryId].stockInfo;
      for await (const condition of Object.keys(sanitizedSummary[categoryId])) {
        const subcategory = sanitizedSummary[categoryId][condition];
        
        if(subcategory.newQty == 0) {
          continue;
        }

        newStockInfo[condition].quantity = subcategory.newQty;
        await StockCategories.updateQuantity(categoryId, newStockInfo);

        const record = {
          item_id: categoryId,
          condition: condition,
          user_id: req.user.id,
          till_id: till.till_id,
          actionInfo: {
            method: "manual",
            summary: subcategory,
            note: note || null
          }
        };

        await StockRecords.addRecord(record);
      }
    }

    res.send({ status: "ok", msg: "Stock levels updated successfully!" });
  } catch (error) {
    console.log(error);
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";  
    }

    res.send({ status: "fail", msg: error });
  }
});


module.exports = router;
