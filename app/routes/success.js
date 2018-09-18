// /success

var router = require("express").Router();

router.get('/', function(req, res){
  res.render('success', {
    layout: 'login-layout'
  });
});

module.exports = router;