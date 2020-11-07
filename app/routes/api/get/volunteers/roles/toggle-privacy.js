// /api/get/volunteers/roles/toggle-privacy

const router = require("express").Router();

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

const Models = require(rootDir + "/app/models/sequelize");
const VolunteerRoles = Models.VolunteerRoles;

router.get("/:role_id", Auth.isLoggedIn, Auth.canAccessPage("volunteerRoles", "update"), async (req, res) => {
	try {
		const role = await VolunteerRoles.getRoleById(req.params.role_id);

		if (!role) {
			throw "Role not found!";
		}

		if (!(req.user.permissions.volunteerRoles.update == true || (req.user.permissions.volunteerRoles.update == "commonWorkingGroup" && req.user.working_groups.includes(role.group_id)))) {
			throw "You don't have permission to change this role's privacy settings";
		}

		if (role.public == 1) {
			await VolunteerRoles.updateRolePrivacy(req.params.role_id, 0);
			req.flash("success_msg", "Role set to private.");
		} else {
			await VolunteerRoles.updateRolePrivacy(req.params.role_id, 1);
			req.flash("success_msg", "Role set to public.");
		}

		res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/view/" + req.params.role_id);
	} catch (error) {
		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		req.flash("error_msg", error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/view/" + req.params.role_id);
	}
});

module.exports = router;
