// /log-outgoing-weight

var router = require("express").Router();

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, function(req, res){
  Settings.getAll(function(err, settings){
    settings = settings[0];
    settings.definitions = JSON.parse(settings.definitions);
    res.render('log-outgoing-weight', {
      title: 'Log Outgoing Weight (Non-member)',
      settings: settings
    });
  })
});

module.exports = router;