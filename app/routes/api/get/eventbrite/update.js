// /api/get/eventbrite/update

var router = require("express").Router();
var request = require("request");
var async = require("async");

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");

var EventbriteKey = process.env.EVENTBRITE_API_KEY;

router.get("/", Auth.isLoggedIn, function(req, res) {
  request.get(
    "https://www.eventbriteapi.com/v3/users/me/owned_events/?order_by=start_desc&status=live&token=" +
      EventbriteKey,
    function(error, response, body) {
      if (!error) {
        var validEvents = {};
        var events = JSON.parse(body).events;

        async.each(
          events,
          function(event, callback) {
            if (
              new Date(event.start.local) > new Date() &&
              event.invite_only == false &&
              event.is_externally_ticketed == false &&
              event.listed == true
            ) {
              request(
                "https://www.eventbriteapi.com/v3/events/" +
                  event.id +
                  "/ticket_classes/?token=" +
                  EventbriteKey,
                function(error, response, body) {
                  if (!error) {
                    var ticket_classes = JSON.parse(body).ticket_classes;
                    validEvents[event.id] = {};
                    validEvents[event.id].name = event.name.text;
                    validEvents[event.id].date = event.start.local;

                    if (ticket_classes.free == true) {
                      validEvents[event.id].price = 0;
                    } else if (
                      ticket_classes.free == false &&
                      ticket_classes.cost
                    ) {
                      validEvents[event.id].price =
                        ticket_classes.cost.major_value;
                    } else {
                      validEvents[event.id].price = null;
                    }

                    try {
                      validEvents[event.id].quantity =
                        ticket_classes.quantity_total -
                        ticket_classes.quantity_sold;
                    } catch (e) {
                      console.log(e);
                      validEvents[event.id].quantity = null;
                    }
                  }
                  callback();
                }
              );
            } else {
              callback();
            }
          },
          function() {
            Tills.getCategoriesByParentId("events", function(err, categories) {
              Object.keys(validEvents).forEach(function(key) {
                let category = {};
                category.id = key;
                category.name = validEvents[key].name;
                category.value = validEvents[key].price;
                category.quantity = validEvents[key].quantity;
                category.allowTokens = 0;
                category.parent = "events";
                if (!categories[key]) {
                  //insert event as new category.
                  Tills.addCategory(category, function(err) {
                    console.log("Inserted");
                  });
                } else {
                  //update
                  Tills.updateCategory(category, function(err) {
                    console.log("Updated");
                  });
                }
              });
              Object.keys(categories).forEach(function(key) {
                if (!validEvents[key]) {
                  //set event category as inactive.
                  Tills.removeCategory(key, function(err) {
                    console.log("Removed");
                  });
                }
              });
            });
          }
        );

        res.send("Done.");
      } else {
        console.log("HTTP STATUS: ", response, error);
        res.send("Done - errors.");
      }
    }
  );
});

module.exports = router;
