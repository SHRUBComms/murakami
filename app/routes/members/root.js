// /members

const router = require("express").Router();

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin", "volunteer", "staff"]), (req, res) => {
	res.redirect(process.env.PUBLIC_ADDRESS + "/members/manage");
});

router.use("/add", require("./add"));
router.use("/manage", require("./manage"));
router.use("/update", require("./update"));
router.use("/view", require("./view"));
router.use("/make-volunteer", require("./make-volunteer"));

module.exports = router;
