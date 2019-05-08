// /settings/email-templates

var router = require("express").Router();

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
    MailTemplates.getAll(function(err, templates, templatesObj) {
      if (err) throw err;
      res.redirect(
        process.env.PUBLIC_ADDRESS +
          "/settings/email-templates/" +
          templates[0].mail_id
      );
    });
  }
);

router.get(
  "/:mail_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("settings", "emailTemplates"),
  function(req, res) {
    MailTemplates.getAll(function(err, templatesArray, templates) {
      WorkingGroups.getById("WG-100", function(err, group) {
        if (err || !templates[req.params.mail_id]) {
          res.redirect(
            process.env.PUBLIC_ADDRESS + "/settings/email-templates/"
          );
        } else {
          res.render("settings/email-templates", {
            title: "Email Templates",
            settingsActive: true,
            templates: templates,
            template: templates[req.params.mail_id],
            footer: templates.footer,
            group: group
          });
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
