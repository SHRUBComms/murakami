// /api/post/volunteers/existence

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Models = require(rootDir + "/app/models/sequelize");

var Volunteers = Models.Volunteers;
var Members = Models.Members;

router.post("/", Auth.canAccessPage("volunteers", "add"), function(req, res) {
  var name = req.body.first_name + " " + req.body.last_name;
  var email = req.body.email;

  var response = {};
  response.status = "fail";

  Members.searchByNameAndEmail({ name: name, email: email }, function(
    err,
    member
  ) {
    if (member[0]) {
      response.status = "ok";
      response.member_id = member[0].member_id;
      Members.getVolInfoById(member[0].member_id, function(err, volInfo) {
        if (volInfo[0]) {
          response.msg = "volunteer";
          res.send(response);
        } else {
          response.msg = "member";
          res.send(response);
        }
      });
    } else {
      res.send(response);
    }
  });
});

module.exports = router;
