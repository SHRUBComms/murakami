// /members/update

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;

const Auth = require(rootDir + "/app/configs/auth");
const Helpers = require(rootDir + "/app/helper-functions/root");

const Validators = require(rootDir + "/app/controllers/validators");
const validateMember = require(rootDir + "/app/controllers/members/validateMember");

router.get("/:member_id", Auth.isLoggedIn, Auth.canAccessPage("members", "update"), async (req, res) => {
  try {
    const member = await Members.getById(req.params.member_id, req.user);
    if(!member) {
      throw "Member not found";
    }
    
    if (!(req.user.permissions.members.view == true || (req.user.permissions.members.view == "commonWorkingGroup" && Helpers.hasOneInCommon(member.working_groups, req.user.working_groups)))) {
      throw "You don't have permission to update this member!";
    }
    
    res.render("members/update", {
      title: "Update Member",
      membersActive: true,
      member: member
    });
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again"
    }
    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + req.params.member_id);
  }  
});

router.post("/:member_id", Auth.canAccessPage("members", "update"), async (req, res) => {
  let updatedMember = { member_id: req.params.member_id };
  try {
    let member = await Members.getById(req.params.member_id, req.user);
    if (!member) {
      throw "Member not found";
    }

    if(!member.canUpdate) {
      throw "You don't have permission to update this member"
    }
    
    updatedMember = req.body.member;
    updatedMember.member_id = req.params.member_id;
    
    await validateMember(req.user, updatedMember);


    if(["staff", "admin"].includes(req.user.class)) {  
      if (!(updatedMember.free == "free" || ["lifetime", "staff", "trustee", "none"].includes(updatedMember.membership_type))) {
        throw "Please select a valid membership type";
      }

      if (updatedMember.membership_type == "none") {
        updatedMember.membership_type = null;
      } else {
        updatedMember.current_exp_membership = "9999-01-01";
      }
 
      if (!moment(updatedMember.current_exp_membership).isValid()) {
        throw "Please enter a valid membership expiration date"
      }

      if (moment(updatedMember.current_exp_membership).isAfter(moment())) {
        updatedMember.is_member = 1;
      } else {
        updatedMember.is_member = 0;
      }

      if (updatedMember.free == "free" || ["lifetime", "staff", "trustee"].includes(updatedMember.membership_type)) {
        updatedMember.free = 1;
      } else {
        updatedMember.free = 0;
      }

      await Validators.number({ name: "tokens", indefiniteArticle: "a number of", value: updatedMember.balance }, { required: true, min: 0, max: 1000 });

    } else {
      // If not an admin or staff member, keep existing membership details
      updatedMember.email = member.email;
      updatedMember.phone_no = member.phone_no;
      updatedMember.address = member.address;
      updatedMember.balance = member.balance;
      updatedMember.membership_type = member.membership_type;
      updatedMember.free = member.free;
    }
    
    await Members.updateBasic(updatedMember);
  
    req.flash("success_msg", "Member updated successfully!");
    res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + updatedMember.member_id);
  } catch (error) {
    
    console.log(error);
    if(typeof error != "string") {
      error = "Something went wrong! Please try again"
    }
    
    res.render("members/update", {
      errors: [{ msg: error }],
      title: "Update Member",
      membersActive: true,
      member: updatedMember
    });
  }
});

module.exports = router;
