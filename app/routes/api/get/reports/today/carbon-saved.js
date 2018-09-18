// /api/get/reports/today/carbon-saved

var router = require("express").Router();

var rootDir = process.env.CWD;

var Carbon = require(rootDir + "/app/models/carbon-calculations");
var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, function(req, res){
  Carbon.getToday(function(err, carbon){
    if(err || carbon.length == 0){
      res.send("0");
    } else {
      totalCarbon = 0;
      Settings.getAll(function(err, settings){
        settings = settings[0];
        settings.definitions = JSON.parse(settings.definitions);
        for(i=0;i<carbon.length;i++){
          carbon[i].trans_object = JSON.parse(carbon[i].trans_object);

          Object.keys(carbon[i].trans_object).forEach(function(key) {
              for(j=0;j<settings.definitions.items.length;j++){
                if(key == settings.definitions.items[j].id){
                  totalCarbon += (carbon[i].trans_object[key] * settings.definitions.items[j].factor) * 1e-3;
                }
              }
          });
        }

        res.send(totalCarbon.toFixed(2));
      });
    }
  });
});

module.exports = router;