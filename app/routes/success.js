// /success

var router = require("express").Router();

var rootDir = process.env.CWD;

router.get("/", function(req, res) {
  res.render("success", {
    title: "Success!",
    disableFlash: true
  });
});

module.exports = router;
