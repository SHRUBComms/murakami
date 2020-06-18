// /settings/email-templates

var router = require("express").Router();

var lodash = require("lodash");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var MailTemplates = Models.MailTemplates;
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("settings", "emailTemplates"),
  function(req, res) {
    res.redirect(
      process.env.PUBLIC_ADDRESS + "/settings/email-templates/footer"
    );
  }
);

router.get(
  "/:mail_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("settings", "emailTemplates"),
  function(req, res) {
    MailTemplates.getAll(function(err, templatesArray, templates) {
      WorkingGroups.getById("WG-100", function(err, group) {
        if (!err && templates[req.params.mail_id]) {
          var dynamicVariablesAvailable = require(rootDir +
            "/app/configs/mail/dynamicVariables.config");

          res.render("settings/email-templates", {
            title: "Email Templates",
            settingsActive: true,
            templates: templates,
            template: templates[req.params.mail_id],
            group: group,
            dynamicVariablesAvailable: dynamicVariablesAvailable,
            categories: [
              {
                id: "common",
                plain: "Common (Members & Non-members)"
              },
              {
                id: "members",
                plain: "All Members (Paid Members & Volunteers)"
              },
              {
                id: "paid-members",
                plain: "Paid Members Only"
              },
              {
                id: "volunteers",
                plain: "Volunteers Only"
              },
              {
                id: "footers",
                plain: "Footers"
              }
            ]
          });
        } else {
          res.redirect(
            process.env.PUBLIC_ADDRESS + "/settings/email-templates/"
          );
        }
      });
    });
  }
);

router.post(
  "/:mail_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("settings", "emailTemplates"),
  function(req, res) {
    MailTemplates.getById(req.params.mail_id, function(err, templateExists) {
      if (templateExists) {
        var subject = req.body.subject;
        var markup = req.body.markup.trim();
        var active = req.body.templateActive;

        if (active == "on") {
          active = 1;
        } else {
          active = 0;
        }

        var template = {
          id: req.params.mail_id,
          subject: subject,
          markup: markup,
          active: active
        };

        MailTemplates.updateTemplate(template, function(err) {
          if (err) {
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/settings/email-templates/" +
                req.params.mail_id
            );
          } else {
            req.flash("success_msg", "Template successfully updated!");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/settings/email-templates/" +
                req.params.mail_id
            );
          }
        });
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/settings/email-templates");
      }
    });
  }
);

module.exports = router;
