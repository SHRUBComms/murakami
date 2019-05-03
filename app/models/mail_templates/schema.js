/* jshint indent: 2 */

var MailTemplates = function(sequelize, DataTypes) {
  return sequelize.define(
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
      tableName: "mail_templates"
    }
  );
};

MailTemplates.getAll = function(callback) {
  var query = "SELECT * FROM mail_templates ORDER BY mail_desc ASC";
  MailTemplates.findAll({ order: { mail_desc: "ASC" } })
    .then(function(templates) {
      callback(null, templates);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

MailTemplates.getById = function(mail_id, callback) {
  MailTemplates.findOne({ where: { mail_id: mail_id } })
    .then(function(template) {
      callback(null, template);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

MailTemplates.updateMailTemplate = function(mail, callback) {
  MailTemplates.update(
    { active: mail.active, subject: mail.subject, markup: mail.markup },
    { where: { mail_id: mail.id } }
  )
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

module.exports = MailTemplates;
