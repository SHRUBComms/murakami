// /till/add

const router = require("express").Router();

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "addTill"), (req, res) => {
    	res.render("till/add", {
      		title: "Add Till",
      		tillsActive: true
    	});
});

module.exports = router;
