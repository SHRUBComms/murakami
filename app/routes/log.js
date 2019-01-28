// /log

var router = require("express").Router();

router.get("/", function(req, res) {
  if (req.query.member_id) {
    res.redirect("/volunteers/log-hours?member_id=" + req.query.member_id);
  } else {
    res.redirect("/volunteers/log-hours");
  }
});

module.exports = router;
