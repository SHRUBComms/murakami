// volunteers/update

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const Users = Models.Users;
const Volunteers = Models.Volunteers;

const Auth = require(rootDir + "/app/configs/auth");
const validateMember = require(rootDir + "/app/controllers/members/validateMember");
const validateVolunteer = require(rootDir + "/app/controllers/volunteers/validateVolunteer");
const MailchimpAPI = require(rootDir + "/app/controllers/mailchimp");

router.get("/:member_id", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "update"), async (req, res) => {
  try {
    const { coordinators } = await Users.getCoordinators(req.user);
    const { skills, contactMethods, rolesByGroup, volunteerAgreement, ourVision, saferSpacesPolicy, membershipBenefits, privacyNotice } = await Volunteers.getSignUpInfo();
    const member = await Members.getById(req.params.member_id, req.user);

    if(!member) {
      throw "Member not found";
    }

    const volunteer = await Volunteers.getVolunteerById(req.params.member_id, req.user);

    if(!volunteer) {
      throw "Member is not a volunteer";
    }

    if(!volunteer.canUpdate) {
      throw "You don't have permission to update this volunteer";
    }

    res.render("volunteers/update", {
      title: "Update Volunteer",
      volunteerActive: true,

      member: member,
      volInfo: volunteer,
      
      coordinators: coordinators,
      roles: rolesByGroup,
      
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone_no: member.phone_no,
      address: member.address,

      staticContent: {
        volunteerAgreement: volunteerAgreement,
        ourVision: ourVision,
        saferSpacesPolicy: saferSpacesPolicy,
        membershipBenefitsInfo: membershipBenefits,
        skills: skills,
        contactMethods: contactMethods,
        privacyNotice: privacyNotice
      }
    });

  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }

    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/view/" + req.params.member_id);
  }
}); 

router.post("/:member_id", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "add"), async (req, res) => {
  const { coordinators, coordinatorsObj } = await Users.getCoordinators(req.user);
  const { skills, contactMethods, rolesByGroup, rolesObj, volunteerAgreement, ourVision, saferSpacesPolicy, membershipBenefits, privacyNotice } = await Volunteers.getSignUpInfo();
  let volunteer = req.body.volInfo; 

  if(!Array.isArray(volunteer.roles)) {
    volunteer.roles = [volunteer.roles]
  }

  if(!Array.isArray(volunteer.assignedCoordinators)) {
    volunteer.assignedCoordinators = [volunteer.assignedCoordinators]
  }

  if(volunteer.survey.skills) {
    if (!Array.isArray(volunteer.survey.skills)) {
      volunteer.survey.skills = [volunteer.survey.skills];
    }
  }

  if (volunteer.survey.preferredCommMethods) {
    if (!Array.isArray(volunteer.survey.preferredCommMethods)) {
      volunteer.survey.preferredCommMethods = [volunteer.survey.preferredCommMethods];
    }
  }

  try {

    const member = await Members.getById(req.params.member_id, req.user);

    if(!member) {
      throw "Member not found";
    }

    const volunteerExists = await Volunteers.getVolunteerById(req.params.member_id, req.user);

    if(!volunteerExists) {
      throw "Member is not a volunteer";
    }

    if(!volunteerExists.canUpdate) {
      throw "You don't have permission to update this volunteer";
    }

    await validateMember(req.user, req.body);

    const sanitizedMember = {
      member_id: req.params.member_id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone_no: req.body.phone_no,
      address: req.body.address,
    };

    volunteer.gdpr = volunteer.gdpr || {};
    volunteer.availability = volunteer.availability || {};
    volunteer.survey = volunteer.survey || {};
    console.log(volunteer); 
    await validateVolunteer(req.user, volunteer, { skills, rolesObj, coordinatorsObj, contactMethods });

    const sanitizedVolunteer = {
      emergencyContactRelation: volunteer.emergencyContactRelation,
      emergencyContactName: volunteer.emergencyContactName,
      emergencyContactPhoneNo: volunteer.emergencyContactPhoneNo,
      roles: volunteer.roles,
      assignedCoordinators: volunteer.assignedCoordinators,
      availability: volunteer.availability,
      survey: volunteer.survey,
      gdpr: volunteer.gdpr
    };


    await Members.updateBasic(sanitizedMember);
    await Volunteers.updateVolunteer(req.params.member_id, sanitizedVolunteer);


    if (moment(member.current_exp_membership, "L").isBefore(moment().add(3, "months"))) {
      await Members.renew(member.member_id, "3_months");
      await Members.updateFreeStatus(member.member_id, 1);
    }

    if (req.body.generalNewsletterConsent == "on") {
        await MailchimpAPI.subscribeToNewsletter(process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID, process.env.SHRUB_MAILCHIMP_SECRET_API_KEY, sanitizedMember);
    }

    req.flash("success_msg", "Volunteer successfully updated!");
    res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/view/" + req.params.member_id);
  } catch (error) {

    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    } 

    res.render("volunteers/update", {
      errors: [{ msg: error }],
      title: "Update Volunteer",
      volunteerActive: true,
      
      member: { member_id: req.params.member_id },
      volInfo: volunteer,
      
      coordinators: coordinators,
      roles: rolesByGroup,
      
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone_no: req.body.phone_no,
      address: req.body.address,
      dob: req.body.dob,

      contactConsent: req.body.contactConsent,
      medicalDisclosed: req.body.medicalDisclosed,
      volunteerAgreementAgreed: req.body.volunteerAgreementAgreed,
      shrubExplained: req.body.shrubExplained,
      safeSpace: req.body.safeSpace,
      membershipBenefits: req.body.membershipBenefits,
      gdprConsent: req.body.gdprConsent,

      staticContent: {
        volunteerAgreement: volunteerAgreement,
        ourVision: ourVision,
        saferSpacesPolicy: saferSpacesPolicy,
        membershipBenefitsInfo: membershipBenefits,
        skills: skills,
        contactMethods: contactMethods,
        privacyNotice: privacyNotice
      }
    });
  }
});
module.exports = router;
