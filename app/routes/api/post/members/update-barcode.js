// /api/post/members/update-barcode

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.post("/:member_id", Auth.isLoggedIn, function(req, res) {
  var barcode = req.body.barcode;
  var response = { status: "fail" };
  Members.getById(req.params.member_id, req.user, function(err, member) {
    if (!err && member) {
      Members.updateBarcode(member.member_id, barcode, function(err) {
        if (!err) {
          response.status = "ok";
          response.msg = "Barcode successfully assigned!";
          res.send(response);
        } else {
          response.msg = "This barcode is already in use! Please try another.";
          res.send(response);
        }
      });
    } else {
      response.msg = "Member not found!";
      res.send(response);
    }
  });
});

module.exports = router;
