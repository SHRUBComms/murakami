// /till/add

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "addTill"),
  function(req, res) {
    res.render("till/add", {
      title: "Add Till",
      tillsActive: true
    });
  }
);

module.exports = router;
