// /users/change-password

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  req.logout();
  req.session = null;
  res.redirect(process.env.PUBLIC_ADDRESS + "/recover");
});

module.exports = router;
