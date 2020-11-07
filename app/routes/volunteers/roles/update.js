// /volunteers/roles/view

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const WorkingGroups = Models.WorkingGroups;
const VolunteerRoles = Models.VolunteerRoles;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");
const validateRole = require(rootDir + "/app/controllers/volunteers/roles/validateRole");

router.get("/:role_id", Auth.isLoggedIn, Auth.canAccessPage("volunteerRoles", "update"), async (req, res) => {
	try {
		let role = await VolunteerRoles.getRoleById(req.params.role_id);
      		if (!role) {
			throw "Role not found"
		}

		if (!(req.user.permissions.volunteerRoles.update == true || (req.user.permissions.volunteerRoles.update == "commonWorkingGroup" && req.user.working_groups.includes(role.group_id)))) {
			throw "You don't have permission to update this role";
		}

        	role.details.role_id = role.role_id;
        	role.details.working_group = role.group_id;

		if (!Array.isArray(role.details.activities)) {
            		role.details.activities = [role.details.activities];
        	}

		if (!Array.isArray(role.details.locations)) {
            		role.details.locations = [role.details.locations];
        	}

        	const { locations, activities, commitmentLengths } = await VolunteerRoles.getRoleSignUpInfo();

		res.render("volunteers/roles/update", {
              		title: "Update Volunter Role",
              		volunteerRolesActive: true,
              		role: role.details,
              		availability: role.availability,
              		locations: locations,
              		commitmentLengths: commitmentLengths,
              		activities: activities
          	});
	} catch (error) {

		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		req.flash("error_msg", error);
        	res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/manage");
	}
});

router.post("/:role_id", Auth.canAccessPage("volunteerRoles", "update"), async (req, res) => {
	let role = req.body.role;
	role.role_id = req.params.role_id;
	role.availability = req.body.availability;
	role.working_group = req.body.working_group;

	const { locations, activities, commitmentLengths } = await VolunteerRoles.getRoleSignUpInfo();

	try {
		const roleExists = await VolunteerRoles.getRoleById(req.params.role_id);
      		if (!roleExists) {
			throw "Role not found";
		}
        	if (!(req.user.permissions.volunteerRoles.update == true || (req.user.permissions.volunteerRoles.update == "commonWorkingGroup" && req.user.working_groups.includes(roleExists.group_id)))) {
			throw "You don't have permission to update this role"
		}

		if(typeof role.activities == "string") {
			role.activities = [role.activities];
		}

		const roleValid = await validateRole(req.user, role, { locations, activities, commitmentLengths });

		const sanitizedRole = {
			title: role.title,
			locations: role.locations,
			activities: role.activities,
			hours_per_week: role.hours_per_week,
			experience_gained: role.experience_gained,
			short_description: role.short_description,
			commitment_length: role.commitment_length,
			experience_required: role.experience_required,
			working_group: role.working_group,
			availability: role.availability
		};

		await VolunteerRoles.updateRole(req.params.role_id, sanitizedRole);

		req.flash("success_msg", "Role updated!");
		res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/view/" + req.params.role_id);
	} catch (error) {
		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		res.render("volunteers/roles/update", {
                  	title: "Update Volunteer Role",
                  	volunteerRolesActive: true,
                  	errors: [{ msg: error }],
                  	locations: locations,
                  	activities: activities,
                  	commitmentLengths: commitmentLengths,
                  	role: role,
                  	availability: role.availability
                });
	}
});

module.exports = router;
