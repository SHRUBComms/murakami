// /api/get/volunteers/roles/get-public
const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const VolunteerRoles = Models.VolunteerRoles;
const WorkingGroups = Models.WorkingGroups;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.verifyByKey("publicVolunteerRoles"), async (req, res) => {
	try {
		const roles = await VolunteerRoles.findAll({ where: { public: 1, removed: 0 }, order: [["dateCreated", "DESC"]] });
      		const { allWorkingGroupsObj } = await WorkingGroups.getAll();
        	res.send({ status: "ok", roles: roles, workingGroups: allWorkingGroupsObj });

    	} catch (error) {
      		res.send({ status: "fail", roles: [] });
    	}
});

router.get("/:role_id", Auth.verifyByKey("publicVolunteerRoles"), async (req, res) => {
	try {
		const role = await VolunteerRoles.findAll({ where: { public: 1, removed: 0, role_id: req.params.role_id } });

		const { allWorkingGroupsObj } = await WorkingGroups.getAll();
		res.send({ status: "ok", role: role[0], workingGroups: allWorkingGroupsObj });

      	} catch (error) {
        	res.send({ status: "fail", role: {} });
	}
});

module.exports = router;
