// /api/post/volunteers/food-collections/get-by-member-id

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const FoodCollectionsKeys = Models.FoodCollectionsKeys;
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

const Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "manageFoodCollectionLink"), async (req, res) => {
  try {
    const member = await Members.getById(req.params.member_id, req.user);
    if (!member) {
      throw "Member not found";
    }
    
    const foodCollectionKey = await FoodCollectionsKeys.getByMemberId(req.params.member_id);

    if (!foodCollectionKey) {
      throw "Food collection key not found";
    }

    const organisations = await FoodCollectionsOrganisations.getAll();

    res.send({ status: "ok", foodCollectionKey: foodCollectionKey, organisations: organisations });
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    res.send({ status: "fail",msg: error });
  }
});

module.exports = router;
