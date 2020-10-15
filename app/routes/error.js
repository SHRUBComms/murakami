// /error

const router = require("express").Router();

router.get("/", (req, res) => {
  	res.render("error");
});

module.exports = router;
