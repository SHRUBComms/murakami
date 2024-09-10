// /api/post/volunteers/send-food-collection-link

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const Volunteers = Models.Volunteers;
const FoodCollectionsKeys = Models.FoodCollectionsKeys;

const Auth = require(rootDir + "/app/controllers/auth");
const Mail = require(rootDir + "/app/controllers/mail/root");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "manageFoodCollectionsLink"),
  async (req, res) => {
    try {
      const member = await Members.getById(req.body.member_id, {
        permissions: { members: { name: true, contactDetails: true } },
      });
      if (!member) {
        throw "Member not found";
      }

      const volunteer = Volunteers.getVolunteerById(member.member_id, req.user);

      if (!volunteer) {
        throw "Member is not a volunteer";
      }

      const foodCollectionKey = await FoodCollectionsKeys.getByMemberId(member.member_id);

      if (!foodCollectionKey) {
        throw "Volunteer doesn't have a food collection key";
      }

      if (foodCollectionKey.active == 0) {
        throw "Key is disabled";
      }

      const foodCollectionLink = `${process.env.PUBLIC_ADDRESS}/food-collections/log/${foodCollectionKey.key}`;
      const recipient = `${member.first_name} ${member.last_name} <${member.email}>`;
      const message = `<p>Hey ${volunteer.first_name},</p>
                    <p>Please use the link below to log your food collections!</p>
                    <a href="${foodCollectionLink}">${foodCollectionLink}</a>
                    <p><small>Please note that this is an automated email.</small></p>`;

      await Mail.sendGeneral(recipient, "Logging Food Collections", message);

      res.send({ status: "ok", msg: "Link successfully sent to volunteer!" });
    } catch (error) {
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }

      res.send({ status: "fail", msg: error });
    }
  }
);

module.exports = router;
