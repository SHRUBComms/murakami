// /logout

var router = require("express").Router();

router.get('/', function(req, res){
  req.logout();
  req.session = null;

  res.redirect('/login');
});

module.exports = router;