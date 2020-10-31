const Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = (StockCategories) => {
	return async (format) => {
    const categories = await StockCategories.findAll({ raw: true });
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
	}
}
