// /volunteers/roles/add

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const WorkingGroups = Models.WorkingGroups;
const VolunteerRoles = Models.VolunteerRoles;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");
const validateRole = require(rootDir + "/app/controllers/volunteers/roles/validateRole");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("volunteerRoles", "add"), async (req, res) => {
	try {
		const { locations, activities, commitmentLengths } = await VolunteerRoles.getRoleSignUpInfo();

		res.render("volunteers/roles/add", {
        		volunteerRolesActive: true,
        		title: "Add Volunteer Role",
        		locations: locations,
        		commitmentLengths: commitmentLengths,
        		activities: activities
      		});
    	} catch (error) {
		res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/manage");
	}
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("volunteerRoles", "add"), async (req, res) => {
	let role = req.body.role;
	const { locations, activities, commitmentLengths } = await VolunteerRoles.getRoleSignUpInfo();

	try {
		role.availability = req.body.availability;

		const roleValid = await validateRole(req.user, role, { locations, activities, commitmentLengths });

		const sanitizedRole = {
			title: role.title,
			locations: role.locations,
			activities: role.activities,
			hours_per_week: role.hours_per_week,
			experience_gained: role.experience_gained,
			short_description: role.short_description,
			experience_required: role.experience_required,
			working_group: role.working_group,
			availability: role.availability
		}

	        const roleId = await VolunteerRoles.addRole(role);
              	req.flash("success_msg", "Role added!");
            	res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/view/" + roleId);

      	} catch (error) {
		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

        	res.render("volunteers/roles/add", {
          		title: "Add Volunteer Role",
          		volunteerRolesActive: true,
          		errors: [{ msg: error }],
          		role: role,
          		locations: locations,
          		activities: activities,
          		commitmentLengths: commitmentLengths
        	});
	}
});

module.exports = router;
