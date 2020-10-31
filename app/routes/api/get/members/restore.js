// /api/get/members/restore

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;

const Helpers = require(rootDir + "/app/helper-functions/root");
const Auth = require(rootDir + "/app/configs/auth");

router.get("/:member_id", Auth.isLoggedIn, Auth.canAccessPage("members", "revokeMembership"), async (req, res) => {
  try {
    const member = await Members.getById(req.params.member_id, req.user);
    if(!member) {
      throw "Member not found";
    }
    
    if (!(req.user.permissions.members.revokeMembership == true || (req.user.permissions.members.revokeMembership == "commonWorkingGroup" && Helpers.hasOneInCommon(req.user.working_groups, member.working_groups)))) {
      throw "You are not permitted to restore this membership";
    }

    await Members.updateStatus(req.params.member_id, 1);
    
    req.flash("success_msg", "Marked as current member - if membership has expired, member will be marked tomorrow morning");
    res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + req.params.member_id);
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }

    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + req.params.member_id);
  }
});

module.exports = router;

