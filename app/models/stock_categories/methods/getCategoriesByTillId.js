const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = (StockCategories, sequelize, DataTypes) => {
  return async (till_id, format) => {
    const query = {
      raw: true,
      where: { [DataTypes.Op.or]: [{ till_id: till_id }, { till_id: null }], active: 1 },
      order: [["name", "ASC"]],
    };

    const categories = await StockCategories.findAll(query);
    if (format == "tree") {
      const tree = await StockCategories.treeify(categories);
      return tree;
    } else if (format == "kv") {
      return categories.reduce((obj, item) => Object.assign(obj, { [item.item_id]: item }), {});
    } else if (format == "treeKv") {
      const tree = await StockCategories.treeify(categories);
      const flat = await Helpers.flatten(tree);
      return flat.reduce((obj, item) => Object.assign(obj, { [item.item_id]: item }), {});
    }
  };
};
