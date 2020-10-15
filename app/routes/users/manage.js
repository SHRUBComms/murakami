// /users/manage

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("users", "view"), async (req, res) => {
  	const users = await Users.getAll(req.user);
    	res.render("users/manage", {
      		title: "Users",
      		users: users,
      		usersActive: true
    	});
});

module.exports = router;
