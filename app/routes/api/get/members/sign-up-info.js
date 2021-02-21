// /api/get/members/sign-up-info

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.verifyByKey("membershipSignUp"), async (req, res) => {
	const { ourVision, saferSpacesPolicy, membershipBenefits, privacyNotice } = await Members.getSignUpInfo();
  res.send({
      signUpInfo: {
        ourVision: ourVision,
        privacyNotice: privacyNotice,
        membershipBenefits: membershipBenefits,
        saferSpacesPolicy: saferSpacesPolicy
      }
  });
});

module.exports = router;
