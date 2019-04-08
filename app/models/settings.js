var con = require("./index");
var mysql = require("mysql");
var async = require("async");

var Settings = {};

Settings.getAll = function(callback) {
  var query = "SELECT * FROM global_settings";
  con.query(query, function(err, settings) {
    settingsObj = {};
    async.each(
      settings,
      function(setting, callback) {
        settingsObj[setting.id] = JSON.parse(setting.data);
        callback();
      },
      function() {
        callback(err, settingsObj);
      }
    );
  });
};

Settings.getStaticContent = function(callback) {
  var query = `SELECT * FROM global_settings WHERE id = "membershipBenefits" OR id = "saferSpacesPolicy" OR id = "volunteerAgreement" OR id = "ourVision" OR id = "privacyNotice"`;
  con.query(query, function(err, settings) {
    async.each(
      settings,
      function(setting, callback) {
        setting.data = JSON.parse(setting.data);
        callback();
      },
      function() {
        callback(err, settings);
      }
    );
  });
};

Settings.getEmailTemplates = function(callback) {
  var query = "SELECT * FROM mail_templates ORDER BY mail_desc ASC";
  con.query(query, callback);
};

Settings.getEmailTemplateById = function(mail_id, callback) {
  var query = "SELECT * FROM mail_templates WHERE mail_id = ?";

  var inserts = [mail_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Settings.updateEmailTemplate = function(mail, callback) {
  var query =
    "UPDATE mail_templates SET active = ?, subject = ?, markup = ? WHERE mail_id = ?";

  var inserts = [mail.active, mail.subject, mail.markup, mail.id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Settings.updateGeneral = function(settings, callback) {
  var query = "UPDATE global_settings SET password_reset = ?";

  var inserts = [settings.password_reset];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Settings.updateSetting = function(id, data, callback) {
  var query = "UPDATE global_settings SET data = ? WHERE id = ?";

  var inserts = [JSON.stringify(data), id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

module.exports = Settings;
