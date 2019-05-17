var nodemailer = require("nodemailer");

var htmlToText = require("nodemailer-html-to-text").htmlToText;
var sanitizeHtml = require("sanitize-html");
var cleaner = require("clean-html");
var moment = require("moment");
moment.locale("en-gb");
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Members = Models.Members;
var Settings = Models.Settings;
var WorkingGroups = Models.WorkingGroups;
var VolunteerRoles = Models.VolunteerRoles;
var MailTemplates = Models.MailTemplates;

var Mail = {};

if (process.env.NODE_ENV == "production") {
  Mail.memberSmtpConfig = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: JSON.parse(process.env.MAIL_SECURE_BOOL),
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_USER,
      clientId: process.env.MAIL_CLIENT_ID,
      clientSecret: process.env.MAIL_CLIENT_SECRET,
      refreshToken: process.env.MAIL_REFRESH_TOKEN
    }
  };
} else {
  Mail.memberSmtpConfig = {
    host: process.env.ETHEREAL_MAIL_HOST,
    port: process.env.ETHEREAL_MAIL_PORT,
    secure: JSON.parse(process.env.ETHEREAL_MAIL_SECURE_BOOL),
    auth: {
      user: process.env.ETHEREAL_MAIL_USER,
      pass: process.env.ETHEREAL_MAIL_PASS
    }
  };
}

Mail.supportSmtpConfig = Mail.memberSmtpConfig;

Mail.sendSupport = function(from_name, from_address, subject, html, callback) {
  html = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"])
  });

  var message = {
    html: html,
    from: "Murakami Support <membership@shrubcoop.org>",
    to: "Ross Hudson <hello@rosshudson.co.uk>",
    subject: subject
  };

  var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
  transporter.use("compile", htmlToText());
  transporter.sendMail(message, callback);
};

Mail.sendAutomated = function(mail_id, member_id, callback) {
  VolunteerRoles.getAll(function(err, rolesArray, allRolesByGroup, allRoles) {
    WorkingGroups.getAll(function(err, allWorkingGroups) {
      Members.getById(
        member_id,
        {
          allVolunteerRoles: allRoles,
          class: "admin",
          permissions: { members: { contactDetails: true, name: true } }
        },
        function(err, member) {
          MailTemplates.getById(mail_id, function(err, mail) {
            MailTemplates.getById("footer", function(err, footer) {
              if (!err) {
                if (mail.active) {
                  if (footer.active) {
                    mail.markup += "<hr />" + footer.markup;
                  }

                  if (mail.markup.indexOf("|roles|") >= 0) {
                    var rolesMarkup = "";
                    async.eachOf(
                      member.roles,
                      function(role, i, callback) {
                        if (allRoles[member.roles[i]]) {
                          rolesMarkup +=
                            "<li><a href='" +
                            process.env.PUBLIC_ADDRESS +
                            "/volunteers/roles/view/" +
                            member.roles[i] +
                            "'>" +
                            allRoles[member.roles[i]].details.title +
                            "</a></li>";
                        }
                        callback();
                      },
                      function() {
                        mail.markup = mail.markup.replace(
                          /\|roles\|/g,
                          rolesMarkup || "<i>No assigned roles.</i>"
                        );
                      }
                    );
                  }

                  if (mail.markup.indexOf("|wg_summary|") >= 0) {
                    var workingGroupsMarkup = "";

                    async.eachOf(
                      member.working_groups,
                      function(working_group, i, callback) {
                        if (allWorkingGroups[working_group]) {
                          if (allWorkingGroups[working_group].welcomeMessage) {
                            workingGroupsMarkup +=
                              allWorkingGroups[working_group].welcomeMessage;

                            // prettier-ignore
                            if (
                                i != (member.working_groups.length - 1)
                              ) {
                                workingGroupsMarkup += "<br />";
                              }
                          }
                        }
                        callback();
                      },
                      function() {
                        mail.markup = mail.markup.replace(
                          /\|wg_summary\|/g,
                          workingGroupsMarkup
                        );
                      }
                    );
                  }

                  mail.markup = mail.markup
                    .replace(/\|first_name\|/g, member.first_name)
                    .replace(/\|last_name\|/g, member.last_name)
                    .replace(
                      /\|fullname\|/g,
                      member.first_name + " " + member.last_name
                    )
                    .replace(/\|tokens\|/g, member.balance)
                    .replace(/\|exp_date\|/g, member.current_exp_membership)
                    .replace(/\|membership_id\|/g, member.member_id)
                    .replace(
                      /\|contact_preferences_link\|/g,
                      process.env.PUBLIC_ADDRESS +
                        "/contact-preferences/" +
                        member.member_id
                    );

                  var message = {
                    html: mail.markup,
                    from: "SHRUB Co-op <membership@shrubcoop.org>",
                    to:
                      member.first_name +
                      " " +
                      member.last_name +
                      " <" +
                      member.email +
                      ">",
                    subject: mail.subject
                  };

                  console.log(message.html);

                  var transporter = nodemailer.createTransport(
                    Mail.supportSmtpConfig
                  );
                  transporter.use("compile", htmlToText());
                  transporter.sendMail(message, callback);
                } else {
                  callback("Email template not active!", null);
                }
              } else {
                callback("Something went wrong.", null);
              }
            });
          });
        }
      );
    });
  });
};

Mail.sendDonation = function(member, callback) {
  MailTemplates.getById("donation", function(err, mail) {
    MailTemplates.getById("footer", function(err, footer) {
      if (mail.active) {
        if (footer.active) {
          mail.markup += "<hr />" + footer.markup;
        }

        mail.markup = mail.markup
          .replace(/\|first_name\|/g, member.first_name)
          .replace(/\|tokens\|/g, member.tokens || 0)
          .replace(/\|balance\|/g, member.balance)
          .replace(/\|last_name\|/g, member.last_name)
          .replace(/\|fullname\|/g, member.first_name + " " + member.last_name)
          .replace(/\|exp_date\|/g, member.current_exp_membership)
          .replace(/\|membership_id\|/g, member.member_id);

        mail.markup = sanitizeHtml(mail.markup, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"])
        });

        var message = {
          html: mail.markup,
          from: "SHRUB Co-op <membership@shrubcoop.org>",
          to:
            member.first_name +
            " " +
            member.last_name +
            " <" +
            member.email +
            ">",
          subject: mail.subject
        };

        var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
        transporter.use("compile", htmlToText());
        transporter.sendMail(message, callback);
      } else {
        callback("Email template not active!", null);
      }
    });
  });
};

Mail.sendUsers = function(to_name, to_address, subject, html, callback) {
  html = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"])
  });

  var message = {
    html: html,
    from: "Murakami <membership@shrubcoop.org>",
    to: to_name + " <" + to_address + ">",
    subject: subject
  };

  var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
  transporter.use("compile", htmlToText());
  transporter.sendMail(message, callback);
};

Mail.sendGeneral = function(to, subject, html, callback) {
  html = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"])
  });

  var message = {
    html: html,
    from: "SHRUB Co-op <membership@shrubcoop.org>",
    to: to,
    subject: subject
  };

  var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
  transporter.use("compile", htmlToText());
  transporter.sendMail(message, callback);
};

module.exports = Mail;
