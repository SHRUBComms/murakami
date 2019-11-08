// /working-groups

var router = require("express").Router();
var async = require("async");

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
          Object.keys(staticContent.texts)[0]
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
      var content;

      if (staticContent.texts[req.params.content_id]) {
        content = staticContent.texts[req.params.content_id];
      } else if (staticContent.lists[req.params.content_id]) {
        content = staticContent.lists[req.params.content_id];
      }

      if (content) {
        res.render("settings/static-content", {
          title: "Static Content",
          settingsActive: true,
          content: content,
          staticContent: staticContent
        });
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/settings/static-content");
      }
    });
  }
);

router.post(
  "/:content_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("settings", "staticContent"),
  function(req, res) {
    Settings.getStaticContent(function(err, staticContent) {
      var content;

      if (staticContent.texts[req.params.content_id]) {
        content = staticContent.texts[req.params.content_id];
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
              req.flash("success_msg", "Static content successfully updated!");
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
      } else if (staticContent.lists[req.params.content_id]) {
        content = staticContent.lists[req.params.content_id];
        var validEntries = {};
        async.eachOf(
          content.data,
          function(entry, key, callback) {
            if (req.body.content[key] == "on") {
              validEntries[key] = true;
            } else {
              validEntries[key] = false;
            }
            callback();
          },
          function() {
            async.eachOf(
              req.body.content,
              function(entry, key, callback) {
                if (entry == "on") {
                  validEntries[key] = true;
                } else {
                  validEntries[key] = false;
                }
                callback();
              },
              function() {
                Settings.updateSetting(content.id, validEntries, function(err) {
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
              }
            );
          }
        );
      } else {
        req.flash("error", "Something went wrong!");
        res.redirect(
          process.env.PUBLIC_ADDRESS +
            "/settings/static-content/" +
            req.params.content_id
        );
      }
    });
  }
);

module.exports = router;
