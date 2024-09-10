const lodash = require("lodash");

module.exports = (StockCategories) => {
  return async (StockRecords, user_id, till_id, categories, quantities) => {
    for await (const itemId of Object.keys(quantities)) {
      const stockInfo = quantities[itemId];
      const newStockInfo = lodash.cloneDeep(categories[itemId].stockInfo);

      if (stockInfo.quantity > 0) {
        newStockInfo.quantity -= stockInfo.quantity;
      }

      for await (const condition of Object.keys(stockInfo)) {
        if (
          stockInfo[condition].quantity > 0 &&
          categories[itemId].conditions.includes(condition)
        ) {
          console.log(condition);
          if (newStockInfo[condition]) {
            newStockInfo[condition].quantity -= stockInfo[condition].quantity;
          }
        }
      }

      await StockCategories.updateQuantity(itemId, newStockInfo);

      for await (const condition of Object.keys(newStockInfo)) {
        const stockInfo = newStockInfo[condition];

        console.log(stockInfo.quantity, categories[itemId].stockInfo[condition].quantity);

        if (Number(stockInfo.quantity) - Number(categories[itemId].stockInfo[condition].quantity)) {
          const record = {
            item_id: itemId,
            condition: condition,
            user_id: user_id,
            till_id: till_id,
            actionInfo: {
              method: "transaction",
              summary: {
                newQty: Number(stockInfo.quantity),
                oldQty: Number(categories[itemId].stockInfo[condition].quantity),
                qtyModifier:
                  Number(stockInfo.quantity) -
                  Number(categories[itemId].stockInfo[condition].quantity),
              },
              note: null,
            },
          };

          await StockRecords.addRecord(record);
        }
      }
    }
    return;
  };
};
