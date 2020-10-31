// /till/stock

const router = require("express").Router();

router.get("/", (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
});

router.use("/levels", require("./levels/root"));

module.exports = router;
