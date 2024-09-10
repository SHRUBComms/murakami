// /error

const router = require("express").Router();

router.get("/", (req, res) => {
  res.render("error", {
    title: "Error",
  });
});

module.exports = router;
