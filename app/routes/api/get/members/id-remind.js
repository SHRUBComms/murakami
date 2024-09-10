// /api/get/members/id-remind

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");
const Mail = require(rootDir + "/app/controllers/mail/root");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "view"),
  async (req, res) => {
    try {
      const member = await Members.getById(req.params.member_id, {
        permissions: { members: { contactDetails: true, name: true } },
      });

      if (!member) {
        throw "Member not found!";
      }

      await Mail.sendAutomatedVolunteer("member-id-remind", member.member_id);
      req.flash("success_msg", "Volunteer has been sent their ID");
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/view/" + req.params.member_id);
    } catch (error) {
      console.log(error);

      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }

      req.flash("error_msg", error);
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/view/" + req.params.member_id);
    }
  }
);

module.exports = router;
