// /working-groups

const router = require("express").Router();

router.get("/", (req, res) => {
	res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/manage");
});

router.use("/add", require("./add"));
router.use("/view", require("./view"));
router.use("/update", require("./update"));
router.use("/manage", require("./manage"));
router.use("/make-copy", require("./make-copy"));

module.exports = router;
