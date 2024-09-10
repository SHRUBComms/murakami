// /api/get/members/destroy

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("members", "delete"),
  async (req, res) => {
    try {
      const member = await Members.getById(req.params.member_id, req.user);
      if (!member) {
        throw "Member not found";
      }

      if (!member.canDelete) {
        throw "You don't have permission to delete this member";
      }

      await Members.redact(req.params.member_id);

      req.flash("success_msg", "Member destroyed!");
      res.redirect(process.env.PUBLIC_ADDRESS + "/members/manage");
    } catch (error) {
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }

      req.flash("error_msg", "Something went wrong!");
      res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + member_id);
    }
  }
);

module.exports = router;
