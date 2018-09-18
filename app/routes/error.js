// /error

var router = require("express").Router();

router.get('/', function(req, res){
  res.render('error');
})

module.exports = router;