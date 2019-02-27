// /logout

var router = require("express").Router();

router.get("/", function(req, res) {
  req.logout();
  req.session = null;

  res.redirect(process.env.PUBLIC_ADDRESS + "/login");
});

module.exports = router;
