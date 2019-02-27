// /
var router = require("express").Router();

router.get("/", function(req, res) {
  if (req.user) {
    if (["admin", "staff", "volunteer"].includes(req.user.class)) {
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/till");
    }
  } else {
    res.redirect(process.env.PUBLIC_ADDRESS + "/login");
  }
});



router.use("/error", require("./error"));
router.use("/log", require("./log"));
router.use("/support", require("./support"));
router.use("/login", require("./login"));
router.use("/contact-preferences", require("./contact-preferences"));
router.use("/recover", require("./recover"));
router.use("/logout", require("./logout"));

// Legacy path.
router.get("/get-carbon-calculations", function(req, res) {
  res.redirect(process.env.PUBLIC_ADDRESS + "/api/get/reports/all-time/carbon-saved");
});


router.get("*", function(req, res) {
  res.render("error", {
    title: "Page Not Found",
    notFound: true
  });
});

module.exports = router;
