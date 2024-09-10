// /working-groups

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Settings = Models.Settings;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("settings", "staticContent"),
  async (req, res) => {
    const staticContent = await Settings.getStaticContent();
    res.redirect(
      process.env.PUBLIC_ADDRESS + "/settings/static-content/" + Object.keys(staticContent.texts)[0]
    );
  }
);

router.get(
  "/:content_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("settings", "staticContent"),
  async (req, res) => {
    try {
      const staticContent = await Settings.getStaticContent();

      let content;
      if (staticContent.texts[req.params.content_id]) {
        content = staticContent.texts[req.params.content_id];
      } else if (staticContent.lists[req.params.content_id]) {
        content = staticContent.lists[req.params.content_id];
      }

      if (!content) {
        throw "Content not found";
      }

      res.render("settings/static-content", {
        title: "Static Content",
        settingsActive: true,
        content: content,
        staticContent: staticContent,
      });
    } catch (error) {
      res.redirect(process.env.PUBLIC_ADDRESS + "/settings/static-content");
    }
  }
);

router.post(
  "/:content_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("settings", "staticContent"),
  async (req, res) => {
    try {
      const staticContent = await Settings.getStaticContent();
      let content;

      if (staticContent.texts[req.params.content_id]) {
        content = staticContent.texts[req.params.content_id];
        content.data.markup = req.body.markup;

        if (!content.data.markup) {
          throw "Please enter something";
        }
        await Settings.updateSetting(content.id, content.data);
        req.flash("success_msg", "Static content successfully updated!");
        res.redirect(
          process.env.PUBLIC_ADDRESS + "/settings/static-content/" + req.params.content_id
        );
      } else if (staticContent.lists[req.params.content_id]) {
        content = staticContent.lists[req.params.content_id];
        const validEntries = {};

        for await (const key of Object.keys(content.data)) {
          if (req.body.content[key] == "on") {
            validEntries[key] = true;
          } else {
            validEntries[key] = false;
          }

          for await (const entryKey of Object.keys(req.body.content)) {
            const entry = req.body.content[entryKey];
            if (entry == "on") {
              validEntries[key] = true;
            } else {
              validEntries[key] = false;
            }
          }
        }

        await Settings.updateSetting(content.id, validEntries);
        req.flash("success_msg", "Static content successfully updated!");
        res.redirect(
          process.env.PUBLIC_ADDRESS + "/settings/static-content/" + req.params.content_id
        );
      } else {
        throw new Error();
      }
    } catch (error) {
      console.log(error);
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }
      req.flash("error_msg", error);
      res.redirect(process.env.PUBLIC_ADDRESS + "/settings/static-content");
    }
  }
);

module.exports = router;
