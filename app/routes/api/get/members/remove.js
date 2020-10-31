// /api/get/members/remove

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;

const Auth = require(rootDir + "/app/configs/auth");
const Helpers = require(rootDir + "/app/helper-functions/root");

router.get("/:member_id", Auth.isLoggedIn, Auth.canAccessPage("members", "revokeMembership"), async (req, res) => {
	try {
		const member = await Members.getById(req.params.member_id, req.user);
		if (!req.user.permissions.members.revokeMembership) {
		}

		if(req.user.permissions.members.revokeMembership == "commonWorkingGroup" && !Helpers.hasOneInCommon(req.user.working_groups, member.working_groups)) {
		}

		await Members.updateStatus(member_id, 0);
		req.flash("success_msg", "Membership revoked!");
	} catch (error) {
	        req.flash("error_msg", "You don't have permission to revoke membership!");
        	res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + member_id);
	}
});

module.exports = router;
