// /carbon-calculations

var router = require("express").Router();

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings");
var Carbon = require(rootDir + "/app/models/carbon-calculations");

var Auth = require(rootDir + "/app/configs/auth");

router.post('/', Auth.isLoggedIn, function(req, res){
  var message = {
    status: "fail",
    msg: null
  };

  var transaction = req.body.transaction;
  var formattedTransaction = {}
  formattedTransaction.member_id = "anon";
  formattedTransaction.trans_object = {};
  formattedTransaction.amount = 0;

  for(i=0; i<transaction.length; i++){

    if(!isNaN(parseFloat(transaction[i].weight)) && transaction[i].weight > 0){

      if(formattedTransaction.trans_object[transaction[i].id] == null){
        formattedTransaction.trans_object[transaction[i].id] = transaction[i].weight;
      } else {
        formattedTransaction.trans_object[transaction[i].id] = +transaction[i].weight + +formattedTransaction.trans_object[transaction[i].id];
      }
      
    }
  }

  Object.keys(formattedTransaction.trans_object).forEach(function(key) {            
    formattedTransaction.amount += +formattedTransaction.trans_object[key];
  }); 


  if(formattedTransaction.amount > 0){

    formattedTransaction.trans_object = JSON.stringify(formattedTransaction.trans_object);
    Carbon.add(formattedTransaction, function(err){
      if(err) {
        message.status = "fail";
        message.msg = "Something went wrong!";
        res.send(message);
      } else {
        totalCarbon = 0;
        Settings.getAll(function(err, settings){
          settings = settings[0];
          settings.definitions = JSON.parse(settings.definitions);
          formattedTransaction.trans_object = JSON.parse(formattedTransaction.trans_object)

          Object.keys(formattedTransaction.trans_object).forEach(function(key) {
              for(j=0;j<settings.definitions.items.length;j++){
                if(key == settings.definitions.items[j].id){
                  totalCarbon += (formattedTransaction.trans_object[key] * settings.definitions.items[j].factor) * 1e-3;
                }
              }
          });
          message.status = "ok";
          message.msg = "Weight logged! " + totalCarbon.toFixed(2) + "kg of carbon saved";
          res.send(message);
        });
      }
    });
  } else {
    message.status = "fail";
    message.msg = "Please enter a total weight greater than 0";
    res.send(message);    
  }

});

module.exports = router;