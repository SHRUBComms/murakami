// /api/post/volunteers/food-collections/get-organisations

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

const Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "manageFoodCollectionLink"), async (req, res) => {
  try {
    const organisations = await FoodCollectionsOrganisations.getAll();
    res.send({ status: "ok", organisations: organisations });
  } catch (error) {
    res.send({ status: "fail", msg: "Something went wrong! Please try again" });
  }
});

module.exports = router;
