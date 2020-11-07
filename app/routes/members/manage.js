// /members/manage

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const Volunteers = Models.Volunteers;
const WorkingGroups = Models.WorkingGroups;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.canAccessPage("members", "view"), async (req, res) => {
	try {
		const total = await Members.getTotals();
		const volunteers = await Volunteers.getByGroupId(null, { permissions: { members: { name: true, membershipDates: true }, volunteers: { roles: true } } });

		total[0].volunteers = Object.keys(volunteers).length

		const { membersArray } = await Members.getAll();

		let sanitizedMembers = [];

		for await (const member of membersArray) {
			const sanitizedMember = await Members.sanitizeMember(member, req.user);
			if(sanitizedMember) {
				sanitizedMembers.push(sanitizedMember);
			}
		}

		res.render("members/manage", {
			title: "Manage Members",
			members: sanitizedMembers,
			membersActive: true,
			total: total[0]
		});
	} catch (error) {
		console.log(error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/error");
	}
});

module.exports = router;
