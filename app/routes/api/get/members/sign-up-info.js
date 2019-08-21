// /api/get/members/sign-up-info

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.verifyByKey("membershipSignUp"), function(req, res) {
  Members.getSignUpInfo(function(
    ourVision,
    saferSpacesPolicy,
    membershipBenefits,
    privacyNotice
  ) {
    res.send({
      signUpInfo: {
        ourVision: ourVision,
        privacyNotice: privacyNotice,
        membershipBenefits: membershipBenefits,
        saferSpacesPolicy: saferSpacesPolicy
      }
    });
  });
});

module.exports = router;
