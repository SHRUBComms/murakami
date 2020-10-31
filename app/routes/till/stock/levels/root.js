// /till/stock/levels

const router = require("express").Router();

router.get("/", (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
});

router.use("/manage", require("./manage"));
router.use("/view", require("./view"));

module.exports = router;
