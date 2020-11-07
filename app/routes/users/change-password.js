// /users/change-password

const router = require("express").Router();

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.isLoggedIn, (req, res) => {
	req.logout();
  	req.session = null;
  	res.redirect(process.env.PUBLIC_ADDRESS + "/recover");
});

module.exports = router;
