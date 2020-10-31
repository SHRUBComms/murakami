// /volunteers/hours/log

const router = require("express").Router();
const request = require("request");
const moment = require("moment");
const sanitizeHtml = require("sanitize-html");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const WorkingGroups = Models.WorkingGroups;
const Members = Models.Members;
const Volunteers = Models.Volunteers;
const VolunteerRoles = Models.VolunteerRoles;
const VolunteerHours = Models.VolunteerHours;
const Tills = Models.Tills;

const Recaptcha = require(rootDir + "/app/controllers/recaptcha");


router.get("/", async (req, res) => {
	try {
	  	let allowed = false;

    		if (!req.user || (req.user && req.user.permissions.volunteerHours.log)) {
      			allowed = true;
    		}

  		if (!allowed) {
			throw "Not permitted"
		}

		const { allWorkingGroupsObj } = await WorkingGroups.getAll();

        	let tillMode = false;
		let till_id = req.query.till_id || null;

		const member_id = req.query.member_id || null;

		if (req.user) {
        		if (till_id) {
          			tillMode = true;
        		}

			res.render("volunteers/hours/log", {
				tillMode: tillMode,
				logVolunteerHoursActive: true,
				till: {
					till_id: till_id,
					group_id: req.user.working_groups[0],
					status: 1
				},
				title: "Log Volunteer Hours",
				volunteerHoursActive: true,
				captcha: Recaptcha.recaptcha.render(),
				working_groups: allWorkingGroupsObj
			});

		} else {
        		res.render("volunteers/hours/log", {
          			title: "Log Volunteer Hours",
          			logoutActive: true,
          			member_id: member_id,
          			captcha: Recaptcha.recaptcha.render(),
          			working_groups: allWorkingGroupsObj,
          			till: { till_id: till_id }
        		});

		}
	} catch (error) {
		res.redirect(process.env.PUBLIC_ADDRESS + "/");
	}
});

router.post("/", async (req, res) => {
	try {
		let allowed = false;
	    	if (!req.user) {
			const recaptchaApproved = await Recaptcha.checkRecaptcha(req.body["g-recaptcha-response"]);

			if(recaptchaApproved == false) {
				throw "Please confirm that you're not a robot";
			}

			allowed = true;

    		} else if (req.user && req.user.permissions.volunteerHours.log) {
			allowed = true;
		}

		if(!allowed) {
			throw "Not permitted";
		}

		let shift = req.body.shift;
                shift.note = sanitizeHtml(shift.note);

		const member = await Members.getById(shift.member_id, { permissions: { members: { name: true } } });

		if(!member) {
			throw "Please check that the member ID you entered is correct";
		}

		if(isNaN(shift.duration)) {
			throw "Please enter a valid duration";
		}

		if(shift.duration < 0.25) {
			throw "Please enter a duration greater than 15 minutes";
		}

		if(shift.note) {
			if(shift.note.length > 200) {
				throw "Please enter a note less than 200 characters long";
			}
		} else {
			shift.note = null;
		}

		const { allWorkingGroupsObj } = await WorkingGroups.getAll();

		if(!allWorkingGroupsObj[shift.working_group]) {
			throw "Please select a valid working group";
		}

		shift.approved = 1;

		await VolunteerHours.createShift(shift);

        	if (moment(member.current_exp_membership).isBefore(moment().add(3, "months"))) {
			await Members.renew(member.member_id, "3_months");
			await Members.updateFreeStatus(member.member_id, 1);
			await Members.updateStatus(member.member_id, 1);
		}

		if(req.user) {
			res.send({ status: "ok", msg: "Shift logged successfully!" });
		} else {
			req.flash("success_msg", "Shift logged successfully!");
			res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log");
		}

	} catch (error) {
		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		if(req.user) {
			res.send({ status: "fail", msg: error })
		} else {
			req.flash("error_msg", error);
			res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log?member_id=" + req.body.shift.member_id);
		}
	}
});

module.exports = router;
