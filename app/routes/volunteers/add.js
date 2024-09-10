// volunteers/add

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const Users = Models.Users;
const Volunteers = Models.Volunteers;

const Auth = require(rootDir + "/app/controllers/auth");
const Mail = require(rootDir + "/app/controllers/mail/root");

const validateMember = require(rootDir + "/app/controllers/members/validateMember");
const validateVolunteer = require(rootDir + "/app/controllers/volunteers/validateVolunteer");
const MailchimpAPI = require(rootDir + "/app/controllers/mailchimp");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "add"), async (req, res) => {
  try {
    const { coordinators } = await Users.getCoordinators(req.user);
    const {
      skills,
      contactMethods,
      rolesByGroup,
      volunteerAgreement,
      ourVision,
      saferSpacesPolicy,
      membershipBenefits,
      privacyNotice,
    } = await Volunteers.getSignUpInfo();

    res.render("volunteers/add", {
      title: "Add Volunteer",
      volunteersActive: true,
      roles: rolesByGroup,
      coordinators: coordinators,
      staticContent: {
        volunteerAgreement: volunteerAgreement,
        ourVision: ourVision,
        saferSpacesPolicy: saferSpacesPolicy,
        membershipBenefitsInfo: membershipBenefits,
        skills: skills,
        contactMethods: contactMethods,
        privacyNotice: privacyNotice,
      },
    });
  } catch (error) {
    req.flash("error_msg", "Something went wrong! Please try again");
    res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
  }
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "add"), async (req, res) => {
  const { coordinators, coordinatorsObj } = await Users.getCoordinators(req.user);
  const {
    skills,
    contactMethods,
    rolesByGroup,
    rolesObj,
    volunteerAgreement,
    ourVision,
    saferSpacesPolicy,
    membershipBenefits,
    privacyNotice,
  } = await Volunteers.getSignUpInfo();
  const volunteer = req.body.volInfo;

  if (!Array.isArray(volunteer.roles)) {
    volunteer.roles = [volunteer.roles];
  }

  if (!Array.isArray(volunteer.assignedCoordinators)) {
    volunteer.assignedCoordinators = [volunteer.assignedCoordinators];
  }

  if (volunteer.survey.skills) {
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
    await validateMember(req.user, req.body);

    const emailInUse = await Members.getByEmail(req.body.email);
    if (emailInUse) {
      throw "Email address is already in use!";
    }

    const contactPreferences = {};

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
      contactPreferences: contactPreferences,
    };

    volunteer.gdpr = volunteer.gdpr || {};
    volunteer.availability = volunteer.availability || {};
    volunteer.survey = volunteer.survey || {};

    await validateVolunteer(req.user, volunteer, {
      skills,
      rolesObj,
      coordinatorsObj,
      contactMethods,
    });

    const sanitizedVolunteer = {
      emergencyContactRelation: volunteer.emergencyContactRelation,
      emergencyContactName: volunteer.emergencyContactName,
      emergencyContactPhoneNo: volunteer.emergencyContactPhoneNo,
      roles: volunteer.roles,
      assignedCoordinators: volunteer.assignedCoordinators,
      availability: volunteer.availability,
      survey: volunteer.survey,
      gdpr: volunteer.gdpr,
    };

    const memberId = await Members.add(sanitizedMember);
    await Volunteers.addExistingMember(memberId, sanitizedVolunteer);
    await Mail.sendAutomatedVolunteer("welcome-volunteer", memberId);

    if (req.body.generalNewsletterConsent == "on") {
      await MailchimpAPI.subscribeToNewsletter(
        process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID,
        process.env.SHRUB_MAILCHIMP_SECRET_API_KEY,
        sanitizedMember
      );
    }

    req.flash("success_msg", "Volunteer successfully added!");
    res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/view/" + memberId);
  } catch (error) {
    if (typeof error != "string") {
      error = "Something went wrong! Please try again";
    }

    res.render("volunteers/add", {
      errors: [{ msg: error }],
      title: "Add Volunteer",
      volunteerActive: true,

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

      generalNewsletterConsent: req.body.generalNewsletterConsent,
      behaviourChangeSurveyConsent: req.body.behaviourChangeSurveyConsent,

      staticContent: {
        volunteerAgreement: volunteerAgreement,
        ourVision: ourVision,
        saferSpacesPolicy: saferSpacesPolicy,
        membershipBenefitsInfo: membershipBenefits,
        skills: skills,
        contactMethods: contactMethods,
        privacyNotice: privacyNotice,
      },
    });
  }
});

module.exports = router;
