// volunteers/invite

const router = require("express").Router();
const validator = require("email-validator");
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");

const Users = Models.Users;
const Members = Models.Members;
const Volunteers = Models.Volunteers;
const VolunteerRoles = Models.VolunteerRoles;
const AccessTokens = Models.AccessTokens;
const Settings = Models.Settings;
const FoodCollectionsKeys = Models.FoodCollectionsKeys;
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

const Auth = require(rootDir + "/app/controllers/auth");
const Mail = require(rootDir + "/app/controllers/mail/root");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "invite"), async (req, res) => {
  let errors = [];
  if (req.query.callback != "true") {
    errors = [
      {
        msg: "If possible, you should add volunteers in person. Please use this feature wisely!",
      },
    ];
  }

  try {
    const defaultFoodCollectorRoleId = await Settings.getById("defaultFoodCollectorRole");
    const defaultFoodCollectorRole = await VolunteerRoles.getRoleById(
      defaultFoodCollectorRoleId.data.role_id
    );
    const coordinatorsObj = await Users.getCoordinators(req.user);

    res.render("volunteers/invite", {
      title: "Invite Volunteer",
      errors: errors,
      volunteersActive: true,
      coordinators: coordinatorsObj,
      defaultFoodCollectorRole: defaultFoodCollectorRole,
    });
  } catch (error) {
    console.log(error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/error");
  }
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "invite"), async (req, res) => {
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const email = req.body.email;
  const roles = [];
  let organisations = req.body.organisations;
  const assignedCoordinators = [req.user.id];

  try {
    if (!first_name) {
      throw "Please enter first name";
    }

    if (!last_name) {
      throw "Please enter last name";
    }

    if (!validator.validate(email)) {
      throw "Please enter a valid email";
    }

    const defaultFoodCollectorRoleId = await Settings.getById("defaultFoodCollectorRole");
    roles.push(defaultFoodCollectorRoleId.data.role_id);

    // Sanitize submitted food collection organisations
    const allFoodCollectionOrganisations = await FoodCollectionsOrganisations.getAll();
    if (Array.isArray(organisations)) {
      if (!Helpers.allBelongTo(organisations, Object.keys(allFoodCollectionOrganisations))) {
        organisations = [];
      }
    } else {
      organisations = [];
    }

    // Sanitize submitted co-ordinators

    // Sanitize submitted roles

    // Check if member/volunteer profile already exists
    const member = await Members.getByEmail(email);

    if (member && !member.volunteer_id) {
      /*
       * If member & volunteer profile already exists:
       * 	* Assign default food collection role to existing volunteer profile
       *	* Assign current user as co-ordinator
       *	* Create unique food collection link, email link to volunteer
       */

      const volunteer = await Volunteers.getVolunteerById(member.volunteer_id, {
        permissions: {
          volunteers: {
            roles: true,
            assignedCoordinators: true,
          },
          members: {
            name: true,
            contactDetails: true,
          },
        },
      });
      if (!volunteer.roles.includes(defaultFoodCollectorRoleId.data.role_id)) {
        volunteer.roles.push(defaultFoodCollectorRoleId.data.role_id);
      }

      if (!volunteer.assignedCoordinators.includes(req.user.id)) {
        volunteer.assignedCoordinators.push(req.user.id);
      }

      await Volunteers.updateRoles(volunteer.member_id, volunteer.roles);
      await Volunteers.updateAssignedCoordinators(
        volunteer.member_id,
        volunteer.assignedCoordinators
      );
      const foodCollectionKey = await FoodCollectionsKeys.createKey({
        member_id: volunteer.member_id,
        organisations: organisations,
      });

      if (!foodCollectionKey) {
        throw "Something went wrong! Please try again";
      }

      const foodCollectionLink =
        process.env.PUBLIC_ADDRESS + "/food-collections/log/" + foodCollectionKey;

      await Mail.sendGeneral(
        `${volunteer.first_name} ${volunteer.last_name} <${volunteer.email}>`,
        "Logging Food Collections",
        `
						<p>Hey ${volunteer.first_name},</p>
						<p>Please use the link below to log your food collections!</p>
						<p><a href="${foodCollectionLink}">${foodCollectionLink}</a></p>
						<p><small>Please note that this is an automated email.</small></p>
						`
      );

      req.flash(
        "success_msg",
        "Volunteer already exists!<br/><ul><li>You have been assigned as their co-coordinator</li><li>The food collector role has been added to their profile</li><li>They have been emailed their unique food collection link</li></ul>"
      );
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/view/" + volunteer.member_id);
    } else if (!member) {
      /*
       * If member profile doesn't exist:
       * 	* Create volunteer sign up invitation, email link to prospective volunteer
       */

      const accessTokenDetails = {
        action: "add-volunteer",
        user_id: req.user.id,
      };

      accessTokenDetails.roles = roles;
      accessTokenDetails.assignedCoordinators = assignedCoordinators;
      accessTokenDetails.foodCollectionOrganisations = organisations;

      accessTokenDetails.email = email;
      accessTokenDetails.first_name = first_name;
      accessTokenDetails.last_name = last_name;

      const expirationTimestamp = moment().add(7, "days").toDate();
      const token = await AccessTokens.createInvite(expirationTimestamp, accessTokenDetails);

      if (!token) {
        throw "Something went wrong! Please try again";
      }

      const inviteLink = process.env.PUBLIC_ADDRESS + "/volunteers/invite/" + token;

      await Mail.sendGeneral(
        `${first_name} ${last_name} <${email}>`,
        "Volunteer Registration",
        `<p>Hey ${first_name},</p>
			<p>You've been invited to register as a volunteer with SHRUB by ${req.user.first_name} ${req.user.last_name}!</p>
			<p>Please follow the link below to register. It will expire at <b>${moment(expirationTimestamp).format("L hh:mm A")}</b>.</p>
			<p><a href="${inviteLink}">${inviteLink}</a></p>`
      );

      req.flash(
        "success_msg",
        `Invite sent successfully! Expires at <b>${moment(expirationTimestamp).format("L hh:mm A")}</b>.`
      );
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/invite?callback=true");
    }
  } catch (error) {
    console.log(error);
    let errorMessage = "Something went wrong! Please try again";
    if (typeof error == "string") {
      errorMessage = error;
    }

    req.flash("error_msg", errorMessage);
    res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/invite?callback=true");
  }
});

router.get("/:token", Auth.isNotLoggedIn, Auth.hasValidToken("add-volunteer"), async (req, res) => {
  try {
    if (!res.invite) {
      throw "Invalid invite";
    }

    const { coordinatorsObj } = await Users.getCoordinators(req.user);
    const {
      rolesObj,
      skills,
      contactMethods,
      volunteerAgreement,
      ourVision,
      saferSpacesPolicy,
      membershipBenefits,
      privacyNotice,
    } = await Volunteers.getSignUpInfo();
    const member = await Members.getByEmail(res.invite.details.email);

    if (!member) {
      res.render("volunteers/add", {
        title: "Add Volunteer",

        assignedRoles: res.invite.details.roles,
        assignedCoordinators: res.invite.details.assignedCoordinators,
        invite: res.invite,
        coordinators: coordinatorsObj,
        roles: rolesObj,

        staticContent: {
          skills: skills,
          contactMethods: contactMethods,
          volunteerAgreement: volunteerAgreement,
          ourVision: ourVision,
          saferSpacesPolicy: saferSpacesPolicy,
          membershipBenefitsInfo: membershipBenefits,
          privacyNotice: privacyNotice,
        },

        first_name: res.invite.details.first_name,
        last_name: res.invite.details.last_name,
        email: res.invite.details.email,
      });
    } else if (member.volunteer_id) {
      res.render("members/make-volunteer", {
        title: "Add Volunteer (Existing Member)",
        member: member,

        assignedRoles: res.invite.details.roles,
        assignedCoordinators: res.invite.details.assignedCoordinators,
        invite: res.invite,
        coordinators: coordinatorsObj,
        roles: rolesObj,

        staticContent: {
          skills: skills,
          contactMethods: contactMethods,
          volunteerAgreement: volunteerAgreement,
          ourVision: ourVision,
          saferSpacesPolicy: saferSpacesPolicy,
          membershipBenefitsInfo: membershipBenefits,
          privacyNotice: privacyNotice,
        },
      });
    } else {
      throw "Malformed invite";
    }
  } catch (error) {
    res.redirect(process.env.PUBLIC_ADDRESS + "/error");
  }
});

router.use("/add-volunteer", require("./add-volunteer"));
router.use("/make-volunteer", require("./make-volunteer"));

module.exports = router;
