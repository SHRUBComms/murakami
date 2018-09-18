// /privacy

var router = require("express").Router();

router.get('/', function (req, res){
  res.redirect("/");
  /*res.render('privacy', {
    title: 'Privacy Policy'
  });*/
});

module.exports = router;