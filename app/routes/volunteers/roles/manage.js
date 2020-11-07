// /volunteers/roles/manage

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const VolunteerRoles = Models.VolunteerRoles;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("volunteerRoles", "view"), async (req, res) => {
	try {
		const { rolesArray, rolesByGroup } = await VolunteerRoles.getAll();
		res.render("volunteers/roles/manage", {
			title: "Manage Volunteer Roles",
			volunteerRolesActive: true,
			rolesGroupedByGroupId: rolesByGroup,
			roles: rolesArray,
			group_id: req.query.group_id || req.user.working_groups[0]
		});
	} catch (error) {
		res.redirect(process.env.PUBLIC_ADDRESS + "/error");
	}
});

module.exports = router;
