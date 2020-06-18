var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var dynamicVariablesAvailable = require(rootDir +
  "/app/configs/mail/dynamicVariables.config");
var GetFooter = require("./getFooter");

var Models = require(rootDir + "/app/models/sequelize");
var VolunteerRoles = Models.VolunteerRoles;
var WorkingGroups = Models.WorkingGroups;
var Members = Models.Members;
var MailTemplates = Models.MailTemplates;

module.exports = function(Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) {
  return function(mail_id, member_id, extraFields, callback) {
    MailTemplates.getById(mail_id, function(err, template) {
      if (!err && template) {
        if (template.active == 1) {
          Members.getById(
            member_id,
            {
              class: "admin",
              permissions: {
                members: {
                  contactDetails: true,
                  name: true,
                  membershipDates: true,
                  balance: true
                }
              }
            },
            function(err, member) {
              if (!err && member) {
                member = Object.assign(member, extraFields);
                GetFooter(member_id, function(footer) {
                  if (footer) {
                    template.markup += "<hr />" + footer;
                  }

                  async.eachOf(
                    dynamicVariablesAvailable,
                    function(variable, variableName, callback) {
                      var regex = new RegExp("\\|" + variableName + "\\|", "g");
                      template.markup = template.markup.replace(
                        regex,
                        member[variableName]
                      );
                      callback();
                    },
                    function() {
                      var message = {
                        html: template.markup,
                        from: "SHRUB Coop <membership@shrubcoop.org>",
                        to:
                          member.first_name +
                          " " +
                          member.last_name +
                          " <" +
                          member.email +
                          ">",
                        subject: template.subject
                      };

                      var transporter = nodemailer.createTransport(
                        Mail.supportSmtpConfig
                      );
                      transporter.use("compile", htmlToText());
                      transporter.sendMail(message, callback);
                    }
                  );
                });
              } else {
                callback("Member not found.", null);
              }
            }
          );
        } else {
          callback("Template is disabled", null);
        }
      } else {
        callback("Template not found.", null);
      }
    });
  };
};
