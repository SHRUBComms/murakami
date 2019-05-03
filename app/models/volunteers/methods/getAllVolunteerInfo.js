module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(settings, callback) {
    var query = `SELECT * FROM volunteer_info
          INNER JOIN members ON volunteer_info.member_id=members.member_id`;
    sequelize.query(query).nodeify(function(err, volunteerInfo) {
      if (volunteerInfo) {
        async.eachOf(
          volunteerInfo,
          function(volunteer, i, callback) {
            if (volunteer.working_groups) {
              volunteer.working_groups = JSON.parse(volunteer.working_groups);

              async.eachOf(
                volunteer.working_groups,
                function(wg, j, callback) {
                  if (workingGroupsObj[wg]) {
                    volunteer.working_groups[j] = workingGroupsObj[wg];
                  }
                  callback();
                },
                function(err) {}
              );
            }

            volunteer.survey = JSON.parse(volunteer.survey);

            Object.keys(volunteer.survey.preferredCommMethod).forEach(function(
              key
            ) {
              if (key == "sms") {
                volunteer.survey.preferredCommMethod[key] = "text message";
              } else if (key == "fb_messenger") {
                volunteer.survey.preferredCommMethod[key] =
                  "Facebook Messenger";
              } else if (key == "whatsapp") {
                volunteer.survey.preferredCommMethod[key] = "WhatsApp";
              } else if (key == "phone_call") {
                volunteer.survey.preferredCommMethod[key] = "phone call";
              } else if (key == "email") {
                volunteer.survey.preferredCommMethod[key] = "email";
              }
            });

            var days = {
              mon: "Monday",
              tue: "Tuesday",
              wed: "Wednesday",
              thu: "Thursday",
              fri: "Friday",
              sat: "Saturday",
              sun: "Sunday"
            };
            var periods = {
              m: "Mornings (10-12)",
              ea: "Early Afternoons (12-2)",
              a: "Afternoons (2-4)",
              la: "Late Afternoons (4-6)",
              e: "Evenings (6-8)"
            };

            volunteer.availability = JSON.parse(volunteer.availability);

            var plainTimes = [];

            async.eachOf(
              volunteer.availability,
              function(value, key, callback) {
                plainTimes.push(
                  days[key.substring(0, 3)] +
                    " " +
                    (periods[key.substring(4, 5)] ||
                      periods[key.substring(4, 6)])
                );

                callback();
              },
              function(err) {
                volunteer.availability = plainTimes;
              }
            );

            callback();
          },
          function(err) {
            callback(err, volunteerInfo);
          }
        );
      } else {
        callback(err, null);
      }
    });
  };
};
