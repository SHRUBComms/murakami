// /
var router = require("express").Router();

router.get('/', function(req, res){
  res.redirect('/members');
});

router.use("/error", require("./error"))
router.use("/log", require("./log"))
router.use("/support", require("./support"))
router.use("/success", require("./success"))
router.use("/log-volunteer-hours", require("./log-volunteer-hours"))
router.use("/login", require("./login"))
router.use("/recover", require("./recover"))
router.use("/privacy", require("./privacy"))
router.use("/log-outgoing-weight", require("./log-outgoing-weight"))
router.use("/carbon-calculations", require("./carbon-calculations"))
router.use("/get-carbon-calculations", require("./get-carbon-calculations"))
router.use("/logout", require("./logout"))

router.get('*', function(req, res){
    res.render('error', {
        title: "Page Not Found",
        notFound: true
    });
});

module.exports = router;