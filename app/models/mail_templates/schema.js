/* jshint indent: 2 */
var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(sequelize, DataTypes) {
  var MailTemplates = sequelize.define(
    "mail_templates",
    {
      active: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "1"
      },
      mail_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
      },
      mail_desc: {
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
