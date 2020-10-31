// /api/post/volunteers/food-collections/disable

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const FoodCollectionsKeys = Models.FoodCollectionsKeys;

const Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "manageFoodCollectionLink"), async (req, res) => {
  try {  
    const member_id = req.body.member_id;

    let foodCollectionKey = await FoodCollectionsKeys.getByMemberId(member_id);
    if (!foodCollectionKey) {
      throw "Volunteer doesn't have a food collection link";
    }
    
    if (foodCollectionKey.active == 0) {
      throw "Link is already disabled";
    }
    
    foodCollectionKey.active = 0;  
    await FoodCollectionsKeys.updateKey(foodCollectionKey);
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    res.send({ status: "fail", msg: error });
  }
});

module.exports = router;
