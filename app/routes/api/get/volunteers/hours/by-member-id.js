// /api/get/volunteers/hours/by-member-id

const router = require("express").Router();

const moment = require("moment");
const async = require("async");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Volunteers = Models.Volunteers;
const VolunteerHours = Models.VolunteerHours;
const Tills = Models.Tills;
const Members = Models.Members;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/:member_id", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "shiftHistory"), async (req, res) => {
	try {
    		const volunteer = await Volunteers.getVolunteerById(req.params.member_id, req.user);
     	 	if (!volunteer) {
			throw "Volunteer not found";
		}

        	if (volunteer.shiftHistory == false) {
			throw "Not permitted";
		}

		const shifts = await VolunteerHours.getByMemberId(req.params.member_id);

		if (shifts.length == 0) {
			throw "No shifts on record";
		}

		let formattedShifts = [];

		for await (const shift of shifts) {
                	let formattedShift = {};
                  	formattedShift.date = moment(shift.date).format("L");
                  	formattedShift.working_group = req.user.allWorkingGroupsObj[shift.working_group].name || "Unknown";
                  	formattedShift.duration = shift.duration_as_decimal;
                  	if (shift.note && shift.note != "null") {
                    		formattedShift.note = shift.note;
                  	} else {
                    		formattedShift.note = "-";
                  	}

                  	formattedShifts.push(formattedShift);
		}

		res.send(formattedShifts);
	} catch (error) {
		res.send([]);
	}
});

module.exports = router;
