// /log

const router = require("express").Router();

router.get("/", (req, res) => {
  if (req.query.member_id) {
    res.redirect(
      process.env.PUBLIC_ADDRESS + "/volunteers/hours/log?member_id=" + req.query.member_id
    );
  } else {
    res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log");
  }
});

module.exports = router;
