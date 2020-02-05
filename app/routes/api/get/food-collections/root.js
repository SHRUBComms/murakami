// /api/get/food-collections/

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");
var sanitizeHtml = require("sanitize-html");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var FoodCollections = Models.FoodCollections;
var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "review"),
  function(req, res) {
    var formattedCollections = [];
    Members.getAll(function(err, members, membersObj) {
      if (!err && membersObj) {
        FoodCollectionsOrganisations.getAll(function(err, organisations) {
          if (!err && organisations) {
            FoodCollections.getUnreviewedCollections(
              function(err, collections) {
                async.each(
                  collections,
                  function(collection, callback) {
                    var formattedCollection = {};
                    if (membersObj[collection.member_id]) {
                      formattedCollection.name =
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
                      formattedCollection.name =
                        "<a href='" +
                        process.env.PUBLIC_ADDRESS +
                        "/volunteers/view/" +
                        membersObj[collection.member_id].member_id +
                        "'>Unknown</a>";
                    }

                    formattedCollection.organisation =
                      organisations[collection.organisation_id].name ||
                      "Unknown";

                    formattedCollection.destination_organisation =
                      organisations[collection.destination_organisation_id]
                        .name || "Unknown";

                    formattedCollection.date = moment(
                      collection.timestamp
                    ).format("D/M/YY hh:mm A");
                    formattedCollection.amount = collection.amount;
                    formattedCollection.note = collection.note || "-";
                    if (formattedCollection.note == "null") {
                      formattedCollection.note = "-";
                    }
                    formattedCollection.note = sanitizeHtml(
                      formattedCollection.note
                    );

                    formattedCollection.options =
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
                    formattedCollections.push(formattedCollection);
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
            res.send([]);
          }
        });
      } else {
        res.send([]);
      }
    });
  }
);

router.use("/approve", require("./approve"));
router.use("/deny", require("./deny"));
router.use("/organisations", require("./organisations/root"));

module.exports = router;
