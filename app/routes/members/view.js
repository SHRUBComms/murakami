// /members/view

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const WorkingGroups = Models.WorkingGroups;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/:member_id", Auth.canAccessPage("members", "view"), async (req, res) => {
	try {
		const member = await Members.getById(req.params.member_id, req.user);

		if(!member) {
			throw "Member not found";
		}

		res.render("members/view", {
        		title: "View Member",
        		membersActive: true,
        		member: member,
        		till: {
          			till_id: req.query.till_id,
          			group_id: req.user.working_groups[0]
        		}
      		});
	} catch (error) {
		req.flash("error_msg", "Member not found!");
      		res.redirect(process.env.PUBLIC_ADDRESS + "/members/manage");
	}
});

module.exports = router;
