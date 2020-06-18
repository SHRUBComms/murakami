var Handlebars = require("handlebars");
var fs = require("fs");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var MailTemplates = Models.MailTemplates;

module.exports = function(member_id, callback) {
  MailTemplates.getFooters(function(err, footers) {
    var footerTemplate;
    if (member_id) {
      footerTemplate = footers.members.markup;
    } else {
      footerTemplate = footers.generic.markup;
    }

    footerTemplate = footerTemplate.replace(
      new RegExp("\\|year\\|", "g"),
      new Date().getFullYear()
    );

    if (member_id) {
      footerTemplate = footerTemplate.replace(
        new RegExp("\\|contact_preferences_link\\|", "g"),
        process.env.PUBLIC_ADDRESS + "/contact-preferences/" + member_id
      );
    }

    if (footers.members.active == 0) {
      footerTemplate = "";
    }

    if (footers.generic.active == 0) {
      footerTemplate = "";
    }

    callback(footerTemplate);
  });
};
