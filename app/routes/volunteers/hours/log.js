// /volunteers/hours/log

const router = require("express").Router();
const moment = require("moment");
const sanitizeHtml = require("sanitize-html");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const WorkingGroups = Models.WorkingGroups;
const Members = Models.Members;
const VolunteerHours = Models.VolunteerHours;

router.get("/", async (req, res) => {
  try {
    if (!req.user || !req.user.permissions.volunteerHours.log) {
      throw "Not permitted";
    }

    const { allWorkingGroupsObj } = await WorkingGroups.getAll();
    const till_id = req.query.till_id || null;

    res.render("volunteers/hours/log", {
      tillMode: !!till_id,
      logVolunteerHoursActive: true,
      till: {
        till_id: till_id,
        group_id: req.user.working_groups[0],
        status: 1,
      },
      title: "Log Volunteer Hours",
      volunteerHoursActive: true,
      working_groups: allWorkingGroupsObj,
    });
  } catch (error) {
    res.redirect(process.env.PUBLIC_ADDRESS + "/");
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.user || !req.user.permissions.volunteerHours.log) {
      throw "Not permitted";
    }

    const shift = req.body.shift;
    shift.note = sanitizeHtml(shift.note);

    const member = await Members.getById(shift.member_id, {
      permissions: { members: { name: true } },
    });

    if (!member) {
      throw "The member could not be found.";
    }

    if (isNaN(shift.duration)) {
      throw "Please enter a valid duration";
    }

    if (shift.duration < 0.25) {
      throw "Please enter a duration greater than 15 minutes";
    }

    if (!shift.date) {
      shift.date = new Date();
    } else {
      if (moment(shift.date).isAfter(moment())) {
        throw "Please enter a date in the past";
      }
    }

    if (shift.note) {
      if (shift.note.length > 200) {
        throw "Please enter a note less than 200 characters long";
      }
    } else {
      shift.note = null;
    }

    const { allWorkingGroupsObj } = await WorkingGroups.getAll();

    if (!allWorkingGroupsObj[shift.working_group]) {
      throw "Please select a valid working group";
    }

    shift.approved = 1;

    await VolunteerHours.createShift(shift);

    if (moment(member.current_exp_membership).isBefore(moment().add(3, "months"))) {
      await Members.renew(member.member_id, "3_months");
      await Members.updateFreeStatus(member.member_id, 1);
      await Members.updateStatus(member.member_id, 1);
    }

    res.send({ status: "ok", msg: "Shift logged successfully!" });
  } catch (error) {
    let msg;
    if (typeof error === "string") {
      msg = error;
    } else {
      msg = "Something went wrong! Please try again";
    }
    res.send({ status: "fail", msg });
  }
});

module.exports = router;
