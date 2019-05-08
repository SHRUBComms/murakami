// /api/post/members/update-barcode

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");

router.post("/:member_id", Auth.isLoggedIn, function(req, res) {
  var barcode = req.body.barcode;
  var response = { status: "fail" };

  Members.getById(req.params.member_id, req.user, function(err, member) {
    if (!err && member) {
      if (barcode) {
        barcode = barcode.trim();
        if (!isNaN(barcode)) {
          Members.updateBarcode(member.member_id, barcode, function(err) {
            if (!err) {
              response.status = "ok";
              response.msg = "Barcode successfully assigned!";
              res.send(response);
            } else {
              response.msg =
                "This barcode is already in use! Please try another.";
              res.send(response);
            }
          });
        } else {
          response.msg = "Please enter a valid barcode!";
          res.send(response);
        }
      } else {
        response.msg = "Please enter a barcode.";
        res.send(response);
      }
    } else {
      response.msg = "Member not found!";
      res.send(response);
    }
  });
});

module.exports = router;
