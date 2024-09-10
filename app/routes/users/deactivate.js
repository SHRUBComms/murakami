// /users/deactivate

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get(
  "/:user_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("users", "deactivate"),
  async (req, res) => {
    try {
      const user = await Users.getById(req.params.user_id, req.user);

      if (!user) {
        throw "User not found";
      }

      if (user.deactivated == 1) {
        throw "User already deactivated";
      }

      let validClasses = [];
      if (req.user.class == "admin") {
        validClasses = ["admin", "staff", "volunteer", "till"];
      } else {
        validClasses = ["till", "volunteer"];
      }

      console.log("Permitted to deactivate:", user.canDeactivate);

      if (!user.canDeactivate) {
        throw "You don't have permission to deactivate this user";
      }

      if (!validClasses.includes(user.class)) {
        throw "You can't deactivate a user of a higher class";
      }

      await Users.deactivate(user.id);

      req.flash("success_msg", "User deactivated!");
      res.redirect(process.env.PUBLIC_ADDRESS + "/users/manage");
    } catch (error) {
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }

      req.flash("error_msg", error);
      res.redirect(process.env.PUBLIC_ADDRESS + "/users/update/" + req.params.user_id);
    }
  }
);

module.exports = router;
