// /api/get/users/last-login

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;
const Attempts = Models.Attempts;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/:user_id", Auth.isLoggedIn, Auth.isOfClass(["admin"]), async(req, res) => {
	try {
		const user = await Users.getById(req.params.user_id, req.user);
		if (!user[0]) {
			throw "No user";
		}

		const lastLogin = await Attempts.getLastLogin(req.params.user_id);
		if (!lastLogin[0]) {
			throw "No login records";
		}

		res.send(new Date(lastLogin[0].login_timestamp).toLocaleDateString("en-GB"));
	} catch (error) {
		res.send("Never logged in");
	}
});

module.exports = router;
