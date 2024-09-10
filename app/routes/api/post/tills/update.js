// /api/post/tills/update
const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;

const Auth = require(rootDir + "/app/controllers/auth");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "updateSettings"),
  async (req, res) => {
    try {
      const till = req.body.till;

      if (!till.name) {
        throw "Please enter till name";
      }

      const tillExists = await Tills.getById(till.till_id);

      if (!tillExists) {
        throw "Till not found";
      }

      if (tillExists.disabled == 1) {
        throw "Till is disabled";
      }

      await Tills.updateTill(till);

      res.send({ status: "ok", msg: "Till updated!" });
    } catch (error) {
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }

      res.send({ status: "fail", msg: error });
    }
  }
);

module.exports = router;
