/* jshint indent: 2 */
var Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = function(sequelize, DataTypes) {
  var MailTemplates = sequelize.define(
    "mail_templates",
    {
      mail_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
      },
      category: {
        type: DataTypes.STRING(15),
        allowNull: false
      },
      short_description: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      long_description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      subject: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      markup: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      plaintext: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      active: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "1"
      }
    },
    {
      tableName: "mail_templates",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    MailTemplates,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/mail_templates/methods/"
  );

  return MailTemplates;
};
