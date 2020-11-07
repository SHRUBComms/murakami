// /api/get/members/balance

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/:member_id", Auth.canAccessPage("members", "balance"), async (req, res) => {
	try {
		const member = await Members.getById(req.params.member_id, req.user);
		if (!member) {
			throw "Member not found";
		}

		res.send({ balance: member.balance || 0 });

	} catch (error) {
      		res.send({ balance: 0 });
	}
});

module.exports = router;
