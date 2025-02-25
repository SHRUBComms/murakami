/* jshint indent: 2 */

const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = function (sequelize, DataTypes) {
  const ItemVATCategories = sequelize.define(
    "item_vat_categories",
    {
      item_vat_category_id: {
        type: DataTypes.STRING(11),
        allowNull: false,
        primaryKey: true
      },
      item_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      group_id: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      vat_category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      }
    },
    {
      tableName: "item_vat_categories",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    ItemVATCategories,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/item_vat_categories/methods/"
  );

  return ItemVATCategories;
};