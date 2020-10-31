// /success

const router = require("express").Router();

const rootDir = process.env.CWD;

router.get("/", (req, res) => {
  	res.render("success", {
    		title: "Success!",
    		disableFlash: true
  	});
});

module.exports = router;
