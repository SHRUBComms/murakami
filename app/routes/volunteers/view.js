// /volunteers/view

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;
const Members = Models.Members;
const Volunteers = Models.Volunteers;
const VolunteerRoles = Models.VolunteerRoles;
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "view"),
  async (req, res) => {
    try {
      const member = await Members.getById(req.params.member_id, req.user);

      if (!member) {
        throw "Member not found";
      }

      const volunteer = await Volunteers.getVolunteerById(req.params.member_id, req.user);

      if (!volunteer) {
        throw "Member not a volunteer";
      }

      const { coordinatorsObj } = await Users.getCoordinators({
        permissions: { users: { name: true } },
      });
      const { rolesObj } = await VolunteerRoles.getAll();
      const organisations = await FoodCollectionsOrganisations.getAll();

      res.render("volunteers/view", {
        title: "View Volunteer",
        volunteersActive: true,
        member: member,
        volInfo: volunteer,
        coordinators: coordinatorsObj,
        roles: rolesObj,
        allOrganisations: organisations,
      });
    } catch (error) {
      req.flash("error_msg", "Volunteer doesn't exist!");
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
    }
  }
);

module.exports = router;
