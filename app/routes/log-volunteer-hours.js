// /log-volunteer-hours

var router = require("express").Router();
var Recaptcha = require('express-recaptcha').Recaptcha;

var rootDir = process.env.CWD;
var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);

var Settings = require(rootDir + "/app/models/settings");

router.get('/', function(req, res){
  Settings.getAll(function(err, settings){
    settings = settings[0];
    settings.definitions = JSON.parse(settings.definitions);
    res.render('log-volunteer-hours', {
      title: 'Log Volunteer Hours',
      membersActive: true,
      captcha:recaptcha.render(),
      settings: settings
    });  
  })
})

module.exports = router;