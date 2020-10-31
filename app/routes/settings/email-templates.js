// /settings/email-templates

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const MailTemplates = Models.MailTemplates;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("settings", "emailTemplates"), (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/settings/email-templates/footer");
});

router.get("/:mail_id", Auth.isLoggedIn, Auth.canAccessPage("settings", "emailTemplates"), async (req, res) => {
  try {
    const { templatesObj } = await MailTemplates.getAll();
    const group = req.user.allWorkingGroupsObj["WG-100"];
    
    if (!templatesObj[req.params.mail_id]) {
      throw "Mail template not found";
    }

    const dynamicVariablesAvailable = require(rootDir + "/app/configs/mail/dynamicVariables.config");

    res.render("settings/email-templates", {
      title: "Email Templates",
      settingsActive: true,
      templates: templatesObj,
      template: templatesObj[req.params.mail_id],
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
  } catch (error) {
    console.log(error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/settings/email-templates/");
  }
});

router.post("/:mail_id", Auth.isLoggedIn, Auth.canAccessPage("settings", "emailTemplates"), async (req, res) => {
  try {
    const templateExists = await MailTemplates.getById(req.params.mail_id);
    if (!templateExists) {
      throw "Template not found";
    }
    
    const subject = req.body.subject;
    const markup = req.body.markup.trim();
    let active = req.body.templateActive;

    if (active == "on") {
      active = 1;
    } else {
      active = 0;
    }

    const template = {
      id: req.params.mail_id,
      subject: subject,
      markup: markup,
      active: active
    };

    await MailTemplates.updateTemplate(template);
    req.flash("success_msg", "Template successfully updated!");
    res.redirect(process.env.PUBLIC_ADDRESS + "/settings/email-templates/" + req.params.mail_id);
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/settings/email-templates/" + req.params.mail_id);
  }
});

module.exports = router;
