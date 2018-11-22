// /settings/email-templates

var router = require("express").Router();

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isAdmin, function(req, res) {
  Settings.getEmailTemplates(function(err, templates) {
    if (err) throw err;
    res.redirect("/settings/email-templates/" + templates[0].mail_id);
  });
});

router.get("/:mail_id", Auth.isLoggedIn, Auth.isAdmin, function(req, res) {
  Settings.getEmailTemplates(function(err, templates) {
    if (err) throw err;
    Settings.getEmailTemplateById(req.params.mail_id, function(err, template) {
      if (err || !template[0]) {
        res.redirect("/settings/email-templates/");
      } else {
        res.render("settings/email-templates", {
          title: "Email Templates",
          settingsActive: true,
          templates: templates,
          template: template[0]
        });
      }
    });
  });
});

router.post("/:mail_id", Auth.isLoggedIn, Auth.isAdmin, function(req, res) {
  Settings.getEmailTemplateById(req.params.mail_id, function(err, template) {
    if (err || !template[0]) {
      res.send("Couldn't find that template!");
    }

    var subject = req.body.subject;
    var message = req.body.message;
    var active = req.body.active;

    if (active == "true") {
      active = 1;
    } else {
      active = 0;
    }

    var template = {
      id: req.params.mail_id,
      subject: subject,
      markup: message,
      active: active
    };

    Settings.updateEmailTemplate(template, function(err) {
      if (err) {
        res.send("Something went wrong!");
      } else {
        res.send("Updated!");
      }
    });
  });
});

module.exports = router;
