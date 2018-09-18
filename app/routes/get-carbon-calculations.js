// /get-carbon-calculations

var router = require("express").Router();

router.get("/", function(req, res){
	res.redirect("/api/get/reports/this-year/carbon-saved");
})

module.exports = router;