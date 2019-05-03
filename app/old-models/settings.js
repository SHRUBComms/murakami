var con = require("./index");
var mysql = require("mysql");
var async = require("async");

var Settings = {};

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
