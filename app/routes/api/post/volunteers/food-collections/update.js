// /api/post/volunteers/food-collections/update

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const Volunteers = Models.Volunteers;
const FoodCollectionsKeys = Models.FoodCollectionsKeys;
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "manageFoodCollectionLink"),
  async (req, res) => {
    try {
      const organisations = req.body.organisations || [];
      const member_id = req.body.member_id;

      const member = await Members.getById(member_id, req.user);

      if (!member) {
        throw "Member not found";
      }

      const volunteer = await Volunteers.getVolunteerById(member_id, req.user);

      if (!volunteer) {
        throw "Volunteer is not a member";
      }

      const allOrganisations = await FoodCollectionsOrganisations.getAll();

      if (!Array.isArray(organisations)) {
        throw "Please select at least on organisation";
      }

      if (!Helpers.allBelongTo(organisations, Object.keys(allOrganisations))) {
        throw "Please select valid organisations";
      }

      let foodCollectionKey = await FoodCollectionsKeys.getByMemberId(member_id);

      if (foodCollectionKey) {
        foodCollectionKey.organisations = organisations;
        foodCollectionKey.active = 1;

        await FoodCollectionsKeys.updateKey(foodCollectionKey);
        res.send({
          status: "ok",
          key: foodCollectionKey.key,
          msg: "Food collections link updated!",
        });
      } else {
        foodCollectionKey = { member_id: member_id, organisations: organisations, active: 1 };
        const key = await FoodCollectionsKeys.createKey(foodCollectionKey);
        res.send({ status: "ok", key: key, msg: "Food collections link created!" });
      }
    } catch (error) {
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }

      res.send({ status: "fail", msg: error });
    }
  }
);

module.exports = router;
