// /working-groups

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Settings = Models.Settings;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("settings", "staticContent"),
  function(req, res) {
    Settings.getStaticContent(function(err, staticContent) {
      res.redirect(
        process.env.PUBLIC_ADDRESS +
          "/settings/static-content/" +
          staticContent[0].id
      );
    });
  }
);

router.get(
  "/:content_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("settings", "staticContent"),
  function(req, res) {
    Settings.getStaticContent(function(err, staticContent) {
      Helpers.flattenToIds(staticContent, "id", function(flatStaticContent) {
        var index = flatStaticContent.indexOf(req.params.content_id);

        if (index >= 0) {
          res.render("settings/static-content", {
            title: "Static Content",
            settingsActive: true,
            content: staticContent[index],
            staticContent: staticContent
          });
        } else {
          res.redirect(process.env.PUBLIC_ADDRESS + "/error");
        }
      });
    });
  }
);

router.post(
  "/:content_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("settings", "staticContent"),
  function(req, res) {
    Settings.getStaticContent(function(err, staticContent) {
      Helpers.flattenToIds(staticContent, "id", function(flatStaticContent) {
        var index = flatStaticContent.indexOf(req.params.content_id);

        if (index >= 0) {
          var content = staticContent[index];
          content.data.markup = req.body.markup;

          if (content.data.markup) {
            Settings.updateSetting(content.id, content.data, function(err) {
              if (err) {
                req.flash("error", "Something went wrong!");
                res.redirect(
                  process.env.PUBLIC_ADDRESS +
                    "/settings/static-content/" +
                    req.params.content_id
                );
              } else {
                req.flash(
                  "success_msg",
                  "Static content successfully updated!"
                );
                res.redirect(
                  process.env.PUBLIC_ADDRESS +
                    "/settings/static-content/" +
                    req.params.content_id
                );
              }
            });
          } else {
            req.flash("error", "Please enter something!");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/settings/static-content/" +
                req.params.content_id
            );
          }
        } else {
          req.flash("error", "Something went wrong!");
          res.redirect(
            process.env.PUBLIC_ADDRESS +
              "/settings/static-content/" +
              req.params.content_id
          );
        }
      });
    });
  }
);

module.exports = router;
