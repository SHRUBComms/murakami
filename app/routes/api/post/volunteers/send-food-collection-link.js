// /api/post/volunteers/send-food-collection-link

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");

var Members = require(rootDir + "/app/models/members");

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
      Members.getById(member_id, { class: "admin" }, function(err, volunteer) {
        if (volunteer) {
          Mail.sendGeneral(
            volunteer.first_name +
              " " +
              volunteer.last_name +
              "<" +
              volunteer.email +
              ">",
            "Your Food Collections Link",
            "<p>Hey " +
              volunteer.first_name +
              ",</p>" +
              "<p>To log your food collections please use the link below.</p>" +
              "<a href='" +
              link +
              "'>" +
              link +
              "</a>",
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
      });
    } else {
      response.msg = "Invalid link.";
      res.send(response);
    }
  }
);

module.exports = router;
