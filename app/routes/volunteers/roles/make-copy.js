// /volunteers/roles/make-copy

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const WorkingGroups = Models.WorkingGroups;
const VolunteerRoles = Models.VolunteerRoles;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get("/:role_id", Auth.isLoggedIn, Auth.canAccessPage("volunteerRoles", "add"), async (req, res) => {
	try {
		let role = await VolunteerRoles.getRoleById(req.params.role_id);
		if (!role) {
			throw "Role not found";
		}

		if (!(req.user.permissions.volunteerRoles.view == true || (req.user.permissions.volunteerRoles.view == "commonWorkingGroup" && req.user.working_groups.includes(role.group_id)))) {
			throw "Not permitted";
		}

		role.details.working_group = role.group_id;

		if (!Array.isArray(role.details.activities)) {
			role.details.activities = [role.details.activities];
		}

		if (!Array.isArray(role.details.locations)) {
			role.details.locations = [role.details.locations];
		}

		const { allLocations, allActivities, commitmentLengths } = await VolunteerRoles.getRoleSignUpInfo();

		res.render("volunteers/roles/add", {
			title: "Duplicate Volunter Role",
			volunteerRolesActive: true,
			role: role.details,
			availability: role.availability,
			locations: allLocations,
			commitmentLengths: commitmentLengths,
			activities: allActivities
		});
	} catch (error) {
		res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/view/" + req.params.role_id);
	}
});
module.exports = router;
