// /log

var router = require("express").Router();

router.get('/', function(req, res){
  res.redirect('/log-volunteer-hours');
})

module.exports = router;