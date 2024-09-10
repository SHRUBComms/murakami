// /members/make-volunteer

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const Users = Models.Users;
const Volunteers = Models.Volunteers;

const Auth = require(rootDir + "/app/controllers/auth");
const validateVolunteer = require(rootDir + "/app/controllers/volunteers/validateVolunteer");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "add"),
  async (req, res) => {
    try {
      const member = await Members.getById(req.params.member_id, {
        permissions: {
          members: { name: true, membershipDates: true, contactDetails: true, workingGroups: true },
        },
      });
      if (!member) {
        throw "Member not found";
      }

      const volunteer = await Volunteers.getVolunteerById(req.params.member_id, req.user);

      if (volunteer) {
        throw "Member is already a volunteer!";
      }

      const { coordinators } = await Users.getCoordinators(req.user);
      const { skills, contactMethods, rolesByGroup, volunteerAgreement } =
        await Volunteers.getSignUpInfo();

      res.render("members/make-volunteer", {
        title: "Add Volunteer (Existing Member)",
        membersActive: true,
        member: member,
        volInfo: volunteer,
        staticContent: {
          volunteerAgreement: volunteerAgreement,
          skills: skills,
          contactMethods: contactMethods,
        },
        coordinators: coordinators,
        roles: rolesByGroup,
      });
    } catch (error) {
      console.log(error);
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }

      req.flash("error_msg", error);
      res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + req.params.member_id);
    }
  }
);

router.post("/:member_id", Auth.canAccessPage("volunteers", "add"), async (req, res) => {
  const { coordinators, coordinatorsObj } = await Users.getCoordinators(req.user);
  const { skills, contactMethods, rolesByGroup, rolesObj, volunteerAgreement } =
    await Volunteers.getSignUpInfo();
  let member;

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
    member = await Members.getById(req.params.member_id, {
      permissions: {
        members: { name: true, membershipDates: true, contactDetails: true, workingGroups: true },
      },
    });
    if (!member) {
      throw "Member not found";
    }

    const volunteerExists = await Volunteers.getVolunteerById(req.params.member_id, req.user);

    if (volunteerExists) {
      throw "Member is already a volunteer!";
    }

    volunteer.gdpr = volunteer.gdpr || {};
    volunteer.availability = volunteer.availability || {};
    volunteer.survey = volunteer.survey || {};

    console.log(coordinatorsObj);

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

    await Volunteers.addExistingMember(req.params.member_id, sanitizedVolunteer);

    // await Members.updateWorkingGroups(member.member_id, member.working_groups);

    if (moment(member.current_exp_membership).isBefore(moment().add(3, "months"))) {
      await Members.renew(member.member_id, "3_months");
      await Members.updateFreeStatus(member.member_id, 1);
    }

    req.flash("success_msg", "Volunteer profile created successfully!");
    res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/view/" + req.params.member_id);
  } catch (error) {
    console.log(error);
    if (typeof error != "string") {
      error = "Something went wrong! Please try again";
    }

    res.render("members/make-volunteer", {
      errors: [{ msg: error }],
      title: "Add Volunteer (Existing Member)",
      volunteerActive: true,

      volInfo: volunteer,
      member: member,
      coordinators: coordinators,
      roles: rolesByGroup,

      medicalDisclosed: req.body.medicalDisclosed,
      volunteerAgreementAgreed: req.body.volunteerAgreementAgreed,

      staticContent: {
        volunteerAgreement: volunteerAgreement,
        skills: skills,
        contactMethods: contactMethods,
      },
    });
  }
});

module.exports = router;
