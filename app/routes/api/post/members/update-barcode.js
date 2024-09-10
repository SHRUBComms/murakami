// /api/post/members/update-barcode

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");

router.post(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("members", "view"),
  async (req, res) => {
    try {
      let barcode = req.body.barcode;

      const member = await Members.getById(req.params.member_id, req.user);

      if (!member) {
        throw "Member not found";
      }

      if (!barcode) {
        throw "Please enter a barcode";
      }

      barcode = Number(barcode.trim());

      if (!Number.isInteger(barcode)) {
        throw "Please enter a valid barcode";
      }

      const barcodeInUse = await Members.findOne({ where: { barcode: barcode } });

      if (barcodeInUse) {
        throw "This barcode is already in use! Please try another";
      }

      await Members.updateBarcode(member.member_id, barcode);

      res.send({ status: "ok", msg: "Barcode successfully assigned!" });
    } catch (error) {
      console.log(error);
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }

      res.send({ status: "fail", msg: error });
    }
  }
);

module.exports = router;
