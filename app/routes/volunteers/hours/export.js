// volunteers/hours/export

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const VolunteerHours = Models.VolunteerHours;
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerHours", "export"),
  async (req, res) => {
    try {
      let group_id = null;
      if (
        req.user.permissions.volunteerHours.export == true ||
        (req.user.permissions.volunteerHours.export == "commonWorkingGroup" &&
          req.user.working_groups.includes(req.query.group_id))
      ) {
        group_id = req.query.group_id;
      }

      let shifts = [];

      if (group_id) {
        const { membersObj } = await Members.getAll();
        shifts = await VolunteerHours.getHoursBetweenTwoDatesByWorkingGroup(
          group_id,
          req.query.startDate,
          req.query.endDate,
          membersObj
        );
      }

      res.render("volunteers/hours/export", {
        volunteerHoursActive: true,
        title: "Export Data",
        group: { group_id: group_id || null },
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
        shifts: shifts,
      });
    } catch (error) {
      console.log(error);
      res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
  }
);

module.exports = router;
