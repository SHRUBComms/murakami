// volunteers/manage

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;
const Members = Models.Members;
const Volunteers = Models.Volunteers;
const VolunteerRoles = Models.VolunteerRoles;
const WorkingGroups = Models.WorkingGroups;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "view"), async (req, res) => {
	try {
		if (!req.query.group_id) {
      			return res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage/?group_id=my-volunteers");
		}

      		if (req.user.permissions.volunteers.view == "isCoordinator") {
        		req.query.group_id = "my-volunteers";
      		}

      		if (req.user.permissions.volunteers.view == false) {
			throw "Not permitted";
		}

		if(req.user.permissions.volunteers.view == "commonWorkingGroup" && !req.user.working_groups.includes(req.query.group_id)) {
			if(req.query.group_id != "my-volunteers") {
				throw "Not permitted";
			}
		}

		const { volunteers } = await Volunteers.getByGroupId(req.query.group_id, req.user);
          	const { rolesObj } = await VolunteerRoles.getAll();

		const { coordinatorsObj } = await Users.getCoordinators(req.user);
              	res.render("volunteers/manage", {
                	title: "Manage Volunteers",
                	volunteersActive: true,
                	volunteers: volunteers,
                	roles: rolesObj,
                	coordinators: coordinatorsObj,
                	group: {
                  		group_id: req.query.group_id
                	},
                	volunteerStatus: req.query.volunteers || "all"
        	});
	} catch (error) {
		console.log(error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/error");
	}
});

module.exports = router;
