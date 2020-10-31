// /food-collections/organisations

const router = require("express").Router();

router.get("/", (req, res) => {
	res.redirect(process.env.PUBLIC_ADDRESS + "/food-collections/organisations/manage");
});

router.use("/manage", require("./manage"));
router.use("/view", require("./view"));
router.use("/add", require("./add"));
router.use("/update", require("./update"));

module.exports = router;
