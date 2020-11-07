// /volunteers/invite/add-volunteer

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;
const Members = Models.Members;
const Volunteers = Models.Volunteers;
const AccessTokens = Models.AccessTokens;
const WorkingGroups = Models.WorkingGroups;

const Auth = require(rootDir + "/app/controllers/auth");
const Mail = require(rootDir + "/app/controllers/mail/root");
const validateMember = require(rootDir + "/app/controllers/members/validateMember");
const validateVolunteer = require(rootDir + "/app/controllers/volunteers/validateVolunteer");
const MailchimpAPI = require(rootDir + "/app/controllers/mailchimp");

router.get("/:token", Auth.isNotLoggedIn, Auth.hasValidToken("add-volunteer"), async (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/invite/" + res.invite.token);
});

router.post("/:token", Auth.isNotLoggedIn, Auth.hasValidToken("add-volunteer"), async (req, res) => {
  const { coordinators, coordinatorsObj } = await Users.getCoordinators(req.user);
  const { skills, contactMethods, rolesObj, volunteerAgreement, ourVision, saferSpacesPolicy, membershipBenefits, privacyNotice } = await Volunteers.getSignUpInfo();
  const { allWorkingGroupsFlat } = await WorkingGroups.getAll();
  let volunteer = req.body.volInfo; 

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

  volunteer.assignedCoordinators = res.invite.details.assignedCoordinators;
  volunteer.roles = res.invite.details.roles;

  try {

    await validateMember({}, req.body);

    const emailInUse = await Members.getByEmail(req.body.email);
    if (emailInUse) {
        throw "Email address is already in use!";
    }


    let contactPreferences = {};

    if (req.body.behaviourChangeSurveyConsent == "on") {
      contactPreferences.behaviourChangeSurvey = true;
    }

    const sanitizedMember = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone_no: req.body.phone_no,
      address: req.body.address,
      free: 1,
      membership_type: req.body.membership_type,
      earliest_membership_date: new Date(),
      current_init_membership: new Date(),
      current_exp_membership: moment().add(3, "months").toDate(),
      contactPreferences: contactPreferences
    };

    volunteer.gdpr = volunteer.gdpr || {};
    volunteer.availability = volunteer.availability || {};
    volunteer.survey = volunteer.survey || {};
    
    await validateVolunteer({ allWorkingGroupsFlat: allWorkingGroupsFlat, permissions: { volunteers: { add: true } } }, volunteer, { skills, rolesObj, coordinatorsObj, contactMethods });

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

    const memberId = await Members.add(sanitizedMember);
    await Volunteers.addExistingMember(memberId, sanitizedVolunteer);
    await Mail.sendAutomatedVolunteer("welcome-volunteer", memberId);
    
    if (req.body.generalNewsletterConsent == "on") {
        await MailchimpAPI.subscribeToNewsletter(process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID, process.env.SHRUB_MAILCHIMP_SECRET_API_KEY, sanitizedMember);
    }

    const userInvitedBy = await Users.getById(res.invite.details.user_id, { permissions: { users: { name: true, email: true } } });

    const recipient = `${userInvitedBy.first_name} ${userInvitedBy.last_name} <${userInvitedBy.email}>`;
    const message = `<p>Hey ${userInvitedBy.first_name},</p>
                    <p>This email is to notify you that ${sanitizedMember.first_name} ${sanitizedMember.last_name} has activated their volunteer profile using an invite you sent.</p>
                    <p>If you didn't invite this volunteer, please <a href="${process.env.PUBLIC_ADDRESS}/support">contact support</a> <b>as soon as possible</b></p>`
    await Mail.sendGeneral(recipient, "Volunteer Profile Activated", message);

    await AccessTokens.markAsUsed(res.invite.token);
    res.redirect(process.env.PUBLIC_ADDRESS + "/success");
  } catch (error) {
    console.log(error);
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    } 

    res.render("volunteers/add", {
      errors: [{ msg: error }],
      title: "Add Volunteer",
      volunteerActive: true,

      invite: res.invite,
      volInfo: volunteer,
      
      coordinators: coordinators,
      roles: rolesObj,
      
      first_name: res.invite.details.first_name,
      last_name: res.invite.details.last_name,
      email: res.invite.details.email,
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

  
      generalNewsletterConsent: req.body.generalNewsletterConsent,
      behaviourChangeSurveyConsent: req.body.behaviourChangeSurveyConsent,

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
