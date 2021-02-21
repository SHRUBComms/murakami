// /api/get/members/basic-details

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const CarbonCategories = Models.CarbonCategories;
const Carbon = Models.Carbon;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get("/:member_id", Auth.verifyByKey("membershipSignUp"), async (req, res) => {
	try {
		const member = await Members.getById(req.params.member_id, { permissions: { members: { name: true, membershipDates: true } } });

    if(!member || member.first_name == "[redacted]") {
      throw "Your membership could not be found!"
    }

    let sanitizedMember = {
      first_name: member.first_name,
      earliest_membership_date: moment(member.earliest_membership_date).format("L"),
      current_init_membership: moment(member.current_init_membership).format("L"),
      current_exp_membership: moment(member.current_exp_membership).format("L"),
      carbon_saved: 0
    }

		const carbon = await Carbon.getByMemberId(req.params.member_id);
    if (carbon.length > 0) {
      const carbonCategories = await CarbonCategories.getAll();
      const totalCarbon = await Helpers.calculateCarbon(carbon, carbonCategories);
      sanitizedMember.carbon_saved = (totalCarbon / 1000).toFixed(2); // Convert grams to kg
    }

    res.status(200);
    res.send({ member: sanitizedMember });  
  } catch (error) {

		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

    res.status(400);
    res.send({ error });
	}
});

module.exports = router;
