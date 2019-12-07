var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var VolunteerRoles = Models.VolunteerRoles;
var WorkingGroups = Models.WorkingGroups;
var Members = Models.Members;
var MailTemplates = Models.MailTemplates;

module.exports = function(Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) {
  return function(mail_id, member_id, callback) {
    VolunteerRoles.getAll(function(err, rolesArray, allRolesByGroup, allRoles) {
      WorkingGroups.getAll(function(err, allWorkingGroups) {
        Members.getById(
          member_id,
          {
            allVolunteerRoles: allRoles,
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
                            if (
                              allWorkingGroups[working_group].welcomeMessage
                            ) {
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
                      .replace(
                        /\|exp_date\|/g,
                        moment(member.current_exp_membership).format("LL")
                      )
                      .replace(/\|membership_id\|/g, member.member_id)
                      .replace(
                        /\|contact_preferences_link\|/g,
                        process.env.PUBLIC_ADDRESS +
                          "/contact-preferences/" +
                          member.member_id
                      );

                    var message = {
                      html: mail.markup,
                      from: "SHRUB Coop <membership@shrubcoop.org>",
                      to:
                        member.first_name +
                        " " +
                        member.last_name +
                        " <" +
                        member.email +
                        ">",
                      subject: mail.subject
                    };

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
};
