// /api/post/volunteers/send-food-collection-link

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail/root");

var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;
var FoodCollectionsKeys = Models.FoodCollectionsKeys;

router.post(
  "/",
  Auth.isLoggedIn,

  function(req, res) {
    var response = {};
    response.status = "fail";
    var member_id = req.body.member_id;

    Members.getById(
      member_id,
      { permissions: { members: { name: true, contactDetails: true } } },
      function(err, volunteer) {
        if (!err && volunteer) {
          FoodCollectionsKeys.getByMemberId(volunteer.member_id, function(
            err,
            foodCollectionKey
          ) {
            if(!err && foodCollectionKey){
              if(foodCollectionKey.active == 1){
                var link =
                  process.env.PUBLIC_ADDRESS +
                  "/food-collections/log/" +
                  foodCollectionKey.key;
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
                response.msg = "Key is disabled!";
                res.send(response);
              }
            } else {
              response.msg = "Food logging key doesn't exist!";
              res.send(response);
            }

          });
        } else {
          response.msg = "Volunteer does not exist.";
          res.send(response);
        }
      }
    );
  }
);

module.exports = router;
