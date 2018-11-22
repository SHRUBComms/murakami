// /members/update

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:member_id", Auth.isLoggedIn, Auth.isVolunteerOrAdmin, function(
  req,
  res
) {
  Members.getById(req.params.member_id, function(err, member) {
    if (err || !member[0]) {
      req.flash("error_msg", "Member not found!");
      res.back();
    } else {
      res.render("members/update", {
        title: "Update Member",
        membersActive: true,

        member_id: req.params.member_id,
        first_name: member[0].first_name,
        last_name: member[0].last_name,
        email: member[0].email,
        phone_no: member[0].phone_no,
        address: member[0].address,
        free: member[0].free
      });
    }
  });
});

router.post("/:member_id", Auth.isLoggedIn, Auth.isVolunteerOrAdmin, function(
  req,
  res
) {
  Members.getById(req.params.member_id, function(err, member) {
    if (err || !member[0]) {
      req.flash("error_msg", "Something went wrong, please try again!");
      res.redirect("/members/update/" + req.params.member_id);
    } else {
      var first_name = req.body.first_name.trim();
      var last_name = req.body.last_name.trim();
      var email = req.body.email.trim();
      var phone_no = req.body.phone_no.trim();
      var address = req.body.address.trim();
      var free = req.body.free;

      if (free == "free") {
        free = 1;
      } else {
        free = 0;
      }

      // Validation
      req.checkBody("first_name", "Please enter a first name").notEmpty();
      req
        .checkBody(
          "first_name",
          "Please enter a shorter first name (<= 20 characters)"
        )
        .isLength({ max: 20 });

      req.checkBody("last_name", "Please enter a last name").notEmpty();
      req
        .checkBody(
          "last_name",
          "Please enter a shorter last name (<= 30 characters)"
        )
        .isLength({ max: 30 });

      req.checkBody("email", "Please enter an email address").notEmpty();
      req
        .checkBody(
          "email",
          "Please enter a shorter email address (<= 89 characters)"
        )
        .isLength({ max: 89 });
      req.checkBody("email", "Please enter a valid email address").isEmail();

      if (phone_no) {
        req
          .checkBody("phone_no", "Please enter a shorter phone number (<= 15)")
          .isLength({ max: 15 });
      }

      var member = {
        member_id: req.params.member_id,
        first_name: first_name,
        last_name: last_name,
        email: email,
        phone_no: phone_no,
        address: address,
        free: free
      };

      // Parse request's body
      var errors = req.validationErrors();
      if (errors) {
        res.render("members/update", {
          title: "Update Member",
          membersActive: true,
          errors: errors,
          member_id: req.params.member_id,
          first_name: first_name,
          last_name: last_name,
          email: email,
          phone_no: phone_no,
          address: address,
          free: free
        });
      } else {
        Members.updateBasic(member, function(err, member) {
          if (err) throw err;

          req.flash("success_msg", first_name + " updated!");
          res.redirect("/members/view/" + req.params.member_id);
        });
      }
    }
  });
});

module.exports = router;
