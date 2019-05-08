// /api/post/volunteers/send-food-collection-link

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");

var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;

router.post(
  "/",
  Auth.isLoggedIn,

  function(req, res) {
    var response = {};
    response.status = "fail";
    var member_id = req.body.member_id;
    var link = req.body.link;

    var validURL = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    if (validURL.test(link)) {
      Members.getById(
        member_id,
        { permissions: { members: { name: true, contactDetails: true } } },
        function(err, volunteer) {
          if (volunteer) {
            Mail.sendGeneral(
              volunteer.first_name +
                " " +
                volunteer.last_name +
                "<" +
                volunteer.email +
                ">",
              "Logging Food Collections",
              "<p>Hey " +
                volunteer.first_name +
                ",</p>" +
                "<p>Please use the link below to log your food collections!</p>" +
                "<a href='" +
                link +
                "'>" +
                link +
                "</a>" +
                "<p><small>Please note that this is an automated email.</small></p>",
              function(err) {
                if (!err) {
                  response.status = "ok";
                  response.msg = "Link successfully sent to volunteer!";
                } else {
                  response.msg = "Something went wrong!";
                }
                res.send(response);
              }
            );
          } else {
            response.msg = "Volunteer does not exist.";
            res.send(response);
          }
        }
      );
    } else {
      response.msg = "Invalid link.";
      res.send(response);
    }
  }
);

module.exports = router;
