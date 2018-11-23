var con = require("./index");
var mysql = require("mysql");

var Helpers = require("../configs/helpful_functions");

var async = require("async");

var Members = {};

Members.getAll = function(callback) {
  var query =
    "SELECT * FROM members WHERE first_name != '[redacted]' ORDER BY first_name ASC LIMIT 100000";
  con.query(query, callback);
};

Members.getAllCurrentMembers = function(callback) {
  var query =
    "SELECT * FROM members WHERE first_name != '[redacted]' AND is_member = 1";
  con.query(query, callback);
};

Members.searchByName = function(search, callback) {
  var query =
    "SELECT * FROM members " +
    "WHERE (CONCAT(first_name, ' ', last_name) LIKE ?) AND first_name != '[redacted]'" +
    "ORDER BY first_name ASC LIMIT 3";
  var inserts = ["%" + search + "%"];

  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Members.searchByNameAndGroup = function(search, group_id, callback) {
  var query =
    "SELECT * FROM members " +
    "WHERE (CONCAT(first_name, ' ', last_name) LIKE ?) AND first_name != '[redacted]' " +
    "AND working_groups LIKE ?" +
    "ORDER BY first_name ASC LIMIT 3";
  var inserts = ["%" + search + "%", "%" + group_id + "%"];

  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Members.getById = function(id, callback) {
  var query = "SELECT * FROM members WHERE member_id = ?";
  var inserts = [id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.getVolInfoById = function(id, callback) {
  var query = "SELECT * FROM volunteer_info WHERE member_id = ?";
  var inserts = [id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.putVolInfo = function(volInfo, callback) {
  var query = `INSERT INTO volunteer_info (member_id, emergencyContactRelation, emergencyContactName, emergencyContactPhoneNo, roles, hoursPerWeek, survey, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE emergencyContactRelation = ?, emergencyContactName = ?, emergencyContactPhoneNo = ?, roles = ?, hoursPerWeek = ?, survey = ?, availability = ?`;
  var inserts = [
    volInfo.member_id,
    volInfo.emergencyContactRelation,
    volInfo.emergencyContactName,
    volInfo.emergencyContactPhoneNo,
    volInfo.roles,
    volInfo.hoursPerWeek,
    volInfo.survey,
    volInfo.availability,
    volInfo.emergencyContactRelation,
    volInfo.emergencyContactName,
    volInfo.emergencyContactPhoneNo,
    volInfo.roles,
    volInfo.hoursPerWeek,
    volInfo.survey,
    volInfo.availability
  ];

  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.getMembersWhoJoinedToday = function(callback) {
  var query =
    "SELECT * FROM members WHERE current_init_membership = CURDATE() AND earliest_membership_date = CURDATE()";
  con.query(query, callback);
};

Members.getByEmail = function(email, callback) {
  var query = "SELECT * FROM members WHERE email = ?";
  var inserts = [email];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.getFreeVols = function(callback) {
  var query =
    "SELECT * FROM members WHERE is_member = 1 AND volunteer_status = 0 AND free = 1";
  con.query(query, callback);
};

Members.add = function(member, callback) {
  var query =
    "INSERT INTO members (member_id, first_name, last_name, email, phone_no, address, is_member, free, volunteer_status, first_volunteered, last_volunteered, working_groups, active_swapper, balance, earliest_membership_date, current_init_membership, current_exp_membership) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  // Generate ID!
  Helpers.uniqueIntId(11, "members", "member_id", function(id) {
    member.member_id = id;

    var inserts = [
      member.member_id,
      member.first_name,
      member.last_name,
      member.email,
      member.phone_no,
      member.address,
      1,
      member.free,
      member.volunteer_status,
      null,
      null,
      null,
      0,
      0,
      member.earliest_membership_date,
      member.current_init_membership,
      member.current_exp_membership
    ];
    var sql = mysql.format(query, inserts);

    con.query(sql);
    Members.getById(member.member_id, callback);
  });
};

Members.getNewVolsThisMonth = function(callback) {
  var query =
    "SELECT * FROM members WHERE is_member = 1 AND MONTH(first_volunteered) = MONTH(CURDATE())";
  con.query(query, callback);
};

Members.updateFirstVolunteered = function(member_id, callback) {
  var query = "UPDATE members SET first_volunteered = ? WHERE member_id = ?";
  var dt = new Date();
  var inserts = [new Date(dt.setMonth(dt.getMonth())), member_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.updateLastVolunteered = function(member_id, callback) {
  var query = "UPDATE members SET last_volunteered = ? WHERE member_id = ?";
  var dt = new Date();
  var inserts = [new Date(dt.setMonth(dt.getMonth())), member_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.getMembershipsExpiringToday = function(callback) {
  var query =
    "SELECT * FROM members WHERE is_member = 1 AND current_exp_membership = CURDATE()";
  con.query(query, callback);
};

Members.getAllVolunteers = function(callback) {
  var query = `SELECT * FROM volunteer_info
        INNER JOIN members ON volunteer_info.member_id=members.member_id AND members.is_member=1`;
  con.query(query, callback);
};

Members.getExpired = function(callback) {
  var query =
    "SELECT * FROM members WHERE is_member = 1 AND current_exp_membership < CURDATE()";
  con.query(query, callback);
};

Members.getExpiredTwoYearsAgo = function(callback) {
  var query =
    "SELECT * FROM members WHERE current_exp_membership <= DATE_SUB(CURDATE(), INTERVAL 2 YEAR) AND first_name != '[redacted]'";
  con.query(query, callback);
};

Members.updateActiveSwapperStatus = function(
  member_id,
  active_swapper,
  callback
) {
  var query = "UPDATE members SET active_swapper = ? WHERE member_id = ?";
  var inserts = [active_swapper, member_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.updateBalance = function(member_id, new_balance, callback) {
  var query = "UPDATE members SET balance = ? WHERE member_id = ?";
  var inserts = [new_balance, member_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.updateStatus = function(member_id, state, callback) {
  var query = "UPDATE members SET is_member = ? WHERE member_id = ?";
  var inserts = [state, member_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.updateWorkingGroups = function(
  member_id,
  new_working_groups,
  callback
) {
  var query = "UPDATE members SET working_groups = ? WHERE member_id = ?";
  var inserts = [new_working_groups, member_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.redact = function(member_id, callback) {
  var query =
    "UPDATE members SET first_name = '[redacted]', last_name = '[redacted]', email = '[redacted]', phone_no = '[redacted]', address = '[redacted]', working_groups = '[]', is_member = 0 WHERE member_id = ?";
  var inserts = [member_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.updateBasic = function(member, callback) {
  var query =
    "UPDATE members SET first_name = ?, last_name = ?, email = ?, phone_no = ?, address = ?, free = ? WHERE member_id = ?";
  var inserts = [
    member.first_name,
    member.last_name,
    member.email,
    member.phone_no,
    member.address,
    member.free,
    member.member_id
  ];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.renew = function(member_id, length, callback) {
  var query =
    "UPDATE members SET current_init_membership = ?, current_exp_membership = ?, is_member = 1 WHERE member_id = ?";
  Members.getById(member_id, function(err, member) {
    if (length == "full_year") {
      var dt = new Date();
      member.current_init_membership = new Date(dt.setMonth(dt.getMonth()));

      var dt = new Date();
      member.current_exp_membership = new Date(dt.setMonth(dt.getMonth() + 12));
    } else if (length == "half_year") {
      var dt = new Date();
      member.current_init_membership = new Date(dt.setMonth(dt.getMonth()));

      var dt = new Date();
      member.current_exp_membership = new Date(dt.setMonth(dt.getMonth() + 6));
    } else if (length == "3_months") {
      var dt = new Date();
      member.current_init_membership = new Date(dt.setMonth(dt.getMonth()));

      var dt = new Date();
      member.current_exp_membership = new Date(dt.setMonth(dt.getMonth() + 2));
    }

    var inserts = [
      member.current_init_membership,
      member.current_exp_membership,
      member_id
    ];
    var sql = mysql.format(query, inserts);

    con.query(sql, callback);
  });
};

Members.delete = function(member_id, callback) {
  var query =
    "DELETE FROM members WHERE member_id = ?;" +
    "DELETE FROM transactions WHERE member_id = ?;" +
    "DELETE FROM volunteer_hours WHERE member_id = ?;" +
    "DELETE FROM volunteer_info WHERE member_id = ?;" +
    "DELETE FROM working_group_requests WHERE member_id = ?;" +
    "DELETE FROM carbon WHERE member_id = ?;";

  var inserts = [
    member_id,
    member_id,
    member_id,
    member_id,
    member_id,
    member_id
  ];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Members.getVolunteerInfoByGroupId = function(group_id, callback) {
  var query = `SELECT * FROM volunteer_info
        INNER JOIN members ON volunteer_info.member_id=members.member_id and working_groups LIKE ?`;
  var inserts = ["%" + group_id + "%"];
  var sql = mysql.format(query, inserts);

  con.query(sql, function(err, volunteers) {
    async.each(
      volunteers,
      function(volunteer, callback) {
        volunteer.survey = JSON.parse(volunteer.survey);
        volunteer.availability = JSON.parse(volunteer.availability);
        volunteer.contact = "";
        let commMethods = volunteer.survey.preferredCommMethod;
        if (commMethods.email) {
          volunteer.contact += volunteer.email;
        }
        if (commMethods.sms || commMethods.phone_call || commMethods.whatsapp) {
          if (volunteer.contact) {
            volunteer.contact += "<br />";
          }
          volunteer.contact += volunteer.phone_no + " (";
          methods = [];
          if (commMethods.sms) {
            methods.push("text");
          }
          if (commMethods.phone_call) {
            methods.push("phone call");
          }
          if (commMethods.whatsapp) {
            methods.push("WhatsApp");
          }

          volunteer.contact += methods.join(", ");

          volunteer.contact += ")";
        }
        if (commMethods.fb_messenger) {
          if (volunteer.contact) {
            volunteer.contact += "<br />";
          }
          volunteer.contact += "Facebook Messenger";
        }

        callback();
      },
      function() {
        callback(err, volunteers);
      }
    );
  });
};

Members.getAllVolunteerInfo = function(settings, callback) {
  var query = `SELECT * FROM volunteer_info
        INNER JOIN members ON volunteer_info.member_id=members.member_id`;
  con.query(query, function(err, volunteerInfo) {
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
              volunteer.survey.preferredCommMethod[key] = "Facebook Messenger";
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
                  (periods[key.substring(4, 5)] || periods[key.substring(4, 6)])
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

Members.makeSearchNice = function(member, settings, callback) {
  var beautifulSearch = {
    id: null,
    first_name: null,
    name: null,
    email: null,
    phone_no: null,
    address: null,
    working_groups: []
  };

  beautifulSearch.id = member.member_id;
  beautifulSearch.first_name = member.first_name;
  beautifulSearch.name = member.first_name + " " + member.last_name;
  beautifulSearch.email = member.email;
  beautifulSearch.phone_no = member.phone_no;
  beautifulSearch.address = member.address;

  // Working groups
  if (member.working_groups) {
    member.working_groups = JSON.parse(member.working_groups);

    async.eachOf(
      member.working_groups,
      function(working_group, i, callback) {
        if (working_groups[member.working_groups[i]]) {
          beautifulSearch.working_groups[i] = {};
          beautifulSearch.working_groups[i].group_id =
            working_groups[member.working_groups[i]].group_id;
          beautifulSearch.working_groups[i].name =
            working_groups[member.working_groups[i]].name;
          beautifulSearch.working_groups[i].isMember = true;
        }
        callback();
      },
      function(err) {}
    );
  }

  callback(beautifulSearch);
};

Members.makeNice = function(member, allWorkingGroups, callback) {
  var beautifulMember = {
    id: {
      text: null,
      class: null
    },
    first_name: {
      text: null,
      class: null
    },
    last_name: {
      text: null,
      class: null
    },
    full_name: {
      text: null,
      class: null
    },
    status: {
      text: null,
      class: null
    },
    isMember: {
      text: null,
      class: null
    },
    balance: {
      text: null,
      class: null
    },
    email: {
      text: null,
      class: null
    },
    phone_no: {
      text: null,
      class: null
    },
    address: {
      text: null,
      class: null
    },
    volunteer_status: {
      text: null,
      class: null
    },
    active_swapper: {
      text: null,
      class: null
    },
    working_groups: [],
    last_volunteered: {
      text: {
        nice: null,
        normal: null
      },
      class: null
    },
    earliest_membership_date: {
      text: {
        nice: null,
        normal: null
      },
      class: null
    },
    current_init_membership: {
      text: {
        nice: null,
        normal: null
      },
      class: null
    },
    current_exp_membership: {
      text: {
        nice: null,
        normal: null
      },
      class: null
    }
  };

  beautifulMember.id.text = member.member_id;

  // First name
  beautifulMember.first_name.text = member.first_name;

  // Last name
  beautifulMember.last_name.text = member.last_name;

  // Full name
  beautifulMember.full_name.text = member.first_name + " " + member.last_name;

  // Status
  if (member.is_member == 1) {
    beautifulMember.status.text = "Current member";
    beautifulMember.status.class = "success";
    if (member.free == 0) {
      beautifulMember.status.text += ", paid";
    } else {
      beautifulMember.status.text += ", free";
    }
  } else {
    beautifulMember.status.text = "No longer a member";
    beautifulMember.status.class = "fail";
  }

  beautifulMember.isMember.text = member.is_member;

  // Tokens
  beautifulMember.balance.text = member.balance;

  // Contact
  beautifulMember.email.text = member.email;
  beautifulMember.phone_no.text = member.phone_no;
  beautifulMember.address.text = member.address;

  // Membership info
  if (member.volunteer_status == 2) {
    beautifulMember.volunteer_status.text = "doesn't volunteer";
  } else if (member.volunteer_status == 1) {
    beautifulMember.volunteer_status.text = "volunteers occasionally";
  } else {
    beautifulMember.volunteer_status.text = "volunteers regularly";
  }

  if (member.active_swapper == 1) {
    beautifulMember.active_swapper.text = "an active swapper";
  } else {
    beautifulMember.active_swapper.text = "not an active swapper";
  }

  // Working groups

  if (member.working_groups) {
    member.working_groups = JSON.parse(member.working_groups);

    async.eachOf(
      member.working_groups,
      function(working_group, i, callback) {
        if (allWorkingGroups[member.working_groups[i]]) {
          beautifulMember.working_groups[i] = {};
          beautifulMember.working_groups[i].group_id =
            allWorkingGroups[member.working_groups[i]].group_id;
          beautifulMember.working_groups[i].name =
            allWorkingGroups[member.working_groups[i]].name;
          beautifulMember.working_groups[i].isMember = true;
        }
        callback();
      },
      function(err) {
        console.log();
      }
    );
  }

  beautifulMember.working_groups = beautifulMember.working_groups || [];

  // Nice dates
  var options = { year: "numeric", month: "long", day: "numeric" };
  beautifulMember.earliest_membership_date.text.nice = new Date(
    member.earliest_membership_date
  ).toLocaleDateString("en-GB", options);

  beautifulMember.current_init_membership.text.nice = new Date(
    member.current_init_membership
  ).toLocaleDateString("en-GB", options);

  beautifulMember.current_exp_membership.text.nice = new Date(
    member.current_exp_membership
  ).toLocaleDateString("en-GB", options);

  // Normal dates
  beautifulMember.earliest_membership_date.text.normal = new Date(
    member.earliest_membership_date
  ).toLocaleDateString("en-GB");

  beautifulMember.current_init_membership.text.normal = new Date(
    member.current_init_membership
  ).toLocaleDateString("en-GB");

  beautifulMember.current_exp_membership.text.normal = new Date(
    member.current_exp_membership
  ).toLocaleDateString("en-GB");

  // Volunteer dates

  if (member.last_volunteered) {
    beautifulMember.last_volunteered.text.nice = new Date(
      member.last_volunteered
    ).toLocaleDateString("en-GB", options);
    beautifulMember.last_volunteered.text.normal = new Date(
      member.last_volunteered
    ).toLocaleDateString("en-GB");
  }

  callback(beautifulMember);
};

module.exports = Members;
