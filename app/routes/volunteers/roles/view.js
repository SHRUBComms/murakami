// /volunteers/roles/view

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const WorkingGroups = Models.WorkingGroups;
const VolunteerRoles = Models.VolunteerRoles;

const Auth = require(rootDir + "/app/configs/auth");
const Helpers = require(rootDir + "/app/helper-functions/root");

router.get("/:role_id", Auth.isLoggedIn, Auth.canAccessPage("volunteerRoles", "view"), async (req, res) => {
	try {
		const role = await VolunteerRoles.getRoleById(req.params.role_id);
		const group = await WorkingGroups.getById(role.group_id);

		if (!role) {
			throw "Role not found";
		}

		if (
		  req.user.permissions.volunteerRoles.view == true ||
		  (req.user.permissions.volunteerRoles.view == "commonWorkingGroup" &&
		    req.user.working_groups.includes(role.group_id))
		) {
		  role.canView = true;
		}

		if (
		  req.user.permissions.volunteerRoles.update == true ||
		  (req.user.permissions.volunteerRoles.update == "commonWorkingGroup" &&
		    req.user.working_groups.includes(role.group_id))
		) {
		  role.canUpdate = true;
		}

		res.render("volunteers/roles/view", {
			title: "View Volunter Role",
		  	volunteerRolesActive: true,
		  	role: role,
		  	group: group
		});
	} catch (error) {
		res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/manage");
	}
});

module.exports = router;
