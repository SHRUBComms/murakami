var async = require("async");
var lodash = require("lodash");

module.exports = function(StockCategories, sequelize, DataTypes) {
  return function(StockRecords, user_id, till_id, categories, quantities, callback) {
    var dbErr;
    async.eachOf(
      quantities,
      function(stockInfo, item_id) {
        var newStockInfo = lodash.cloneDeep(categories[item_id].stockInfo);
        if (stockInfo.quantity > 0) {
          newStockInfo.quantity -= stockInfo.quantity;
        }
        async.eachOf(
          stockInfo,
          function(stockInfo, condition, callback) {
            if (
              stockInfo.quantity > 0 &&
              categories[item_id].conditions.includes(condition)
            ) {
              if (newStockInfo[condition]) {
                newStockInfo[condition].quantity -= stockInfo.quantity;
              }
            }
            callback();
          },
          function() {
            StockCategories.updateQuantity(item_id, newStockInfo, function(
              err
            ) {
              async.eachOf(
                newStockInfo,
                function(stockInfo, condition, callback) {

                  var record = {
                    item_id: item_id,
                    condition: condition,
                    user_id: user_id,
                    till_id: till_id,
                    actionInfo: {
                      method: "transaction",
                      summary: {
                        newQty: Number(stockInfo.quantity),
                        oldQty: Number(
                          categories[item_id].stockInfo[condition].quantity
                        ),
                        qtyModifier:
                          Number(stockInfo.quantity) -
                          Number(
                            categories[item_id].stockInfo[condition].quantity
                          )
                      },
                      note: null
                    }
                  };

                  StockRecords.addRecord(record, function() {
                    callback();
                  });
                },
                function() {
                  callback();
                }
              );
            });
          }
        );
      },
      function() {
        callback();
      }
    );
  };
};
