// /privacy

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Settings = Models.Settings;

var Helpers = require(rootDir + "/app/helper-functions/root");

router.get("/", function(req, res) {
  Settings.getStaticContent(function(err, staticContent) {
    Helpers.flattenToIds(staticContent, "id", function(flatStaticContent) {
      var index = flatStaticContent.indexOf("privacyNotice");

      if (index >= 0) {
        res.render("privacy", {
          title: "Privacy Notice",
          privacyNotice: staticContent[index].data
        });
      }
    });
  });
});

module.exports = router;
