// /api/get/food-collections/

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");
var sanitizeHtml = require("sanitize-html");

var rootDir = process.env.CWD;

var FoodCollections = require(rootDir + "/app/models/food-collections");
var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    var formattedCollections = [];
    Members.getAll(function(err, members, membersObj) {
      if (!err && membersObj) {
        FoodCollections.getOrganisations(function(err, organisations) {
          if (!err && organisations) {
            FoodCollections.getUnreviewedCollections(
              function(err, collections) {
                async.each(
                  collections,
                  function(collection, callback) {
                    if (membersObj[collection.member_id]) {
                      collection.name =
                        "<a href='" +
                        process.env.PUBLIC_ADDRESS +
                        "/volunteers/view/" +
                        membersObj[collection.member_id].member_id +
                        "'>" +
                        membersObj[collection.member_id].first_name +
                        " " +
                        membersObj[collection.member_id].last_name +
                        "</a>";
                    } else {
                      collection.name =
                        "<a href='" +
                        process.env.PUBLIC_ADDRESS +
                        "/volunteers/view/" +
                        membersObj[collection.member_id].member_id +
                        "'>Unknown</a>";
                    }

                    collection.organisation =
                      organisations[collection.organisation_id].name ||
                      "Unknown";

                    collection.date = moment(collection.timestamp).format("l");
                    collection.amount = collection.amount;
                    collection.note = collection.note || "-";
                    if (collection.note == "null") {
                      collection.note = "-";
                    }
                    collection.note = sanitizeHtml(collection.note);

                    collection.options =
                      '<div class="btn-group d-flex">' +
                      '<a class="btn btn-success w-100" onclick="foodCollectionsAjax(\'' +
                      process.env.PUBLIC_ADDRESS +
                      "/api/get/food-collections/approve/" +
                      collection.transaction_id +
                      "')\">Approve</a>" +
                      '<a class="btn btn-danger w-100" onclick="foodCollectionsAjax(\'' +
                      process.env.PUBLIC_ADDRESS +
                      "/api/get/food-collections/deny/" +
                      collection.transaction_id +
                      "')\">Deny</a>" +
                      "</div>";
                    formattedCollections.push(collection);
                    callback();
                  },
                  function() {
                    res.send(formattedCollections);
                  }
                );
              },
              function() {
                callback();
              }
            );
          } else {
            console.log(err);
            res.send([]);
          }
        });
      } else {
        console.log(err);
        res.send([]);
      }
    });
  }
);

router.use("/approve", require("./approve"));
router.use("/deny", require("./deny"));
router.use("/organisations", require("./organisations/root"));

module.exports = router;
