// /api/get/tills/stock/get-records

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var StockRecords = Models.StockRecords;
var StockCategories = Models.StockCategories;
var Users = Models.Users;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:item_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "viewStock"),
  function(req, res) {
    StockCategories.getCategoryById(req.params.item_id, function(
      err,
      category
    ) {
      if (!err && category) {
        StockRecords.getRecords(
          req.params.item_id,
          req.query.condition,
          function(err, records) {
            if (!err && records) {
              if (records.length > 0) {
                Users.getAll(req.user, function(err, users, usersObj) {
                  StockRecords.formatRecords(
                    records,
                    usersObj,
                    null,
                    null,
                    function(formattedRecords) {
                      res.send(formattedRecords);
                    }
                  );
                });
              } else {
                res.send([]);
              }
            } else {
              res.send([]);
            }
          }
        );
      } else {
        res.send([]);
      }
    });
  }
);

module.exports = router;
