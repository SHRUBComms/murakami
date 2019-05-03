/* jshint indent: 2 */

var con;
var mysql = require("mysql");
var moment = require("moment");

var Settings = require(process.env.CWD + "/app/models/sequelize").Settings;

var Members = function(sequelize, DataTypes) {
  con = sequelize;
  return sequelize.define(
    "members",
    {
      member_id: {
        type: DataTypes.STRING(11),
        allowNull: false,
        primaryKey: true
      },
      barcode: {
        type: DataTypes.STRING(15),
        allowNull: true,
        unique: true
      },
      first_name: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(89),
        allowNull: false
      },
      phone_no: {
        type: DataTypes.STRING(15),
        allowNull: false
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      is_member: {
        type: DataTypes.INTEGER(1),
        allowNull: false
      },
      free: {
        type: DataTypes.INTEGER(1),
        allowNull: false
      },
      working_groups: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      contactPreferences: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      balance: {
        type: DataTypes.INTEGER(10),
        allowNull: false
      },
      earliest_membership_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      current_init_membership: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      current_exp_membership: {
        type: DataTypes.DATEONLY,
        allowNull: false
      }
    },
    {
      tableName: "members"
    }
  );
};

Members.sanitizeMember = function(member, user, callback) {
  var sanitizedMember = {};

  if (!user.permissions) {
    user.permissions = {};
  } else {
    if (!user.permissions.members) {
      user.permissions.members = {};
    }

    if (!user.permissions.volunteers) {
      user.permissions.volunteers = {};
    }
  }

  if (member) {
    member.full_name = member.first_name + " " + member.last_name;
    try {
      member.working_groups = JSON.parse(member.working_groups);
    } catch (err) {
      member.working_groups = [];
    }

    try {
      member.roles = JSON.parse(member.roles);
    } catch (err) {
      member.roles = [];
    }

    if (member.contactPreferences) {
      member.contactPreferences = JSON.parse(member.contactPreferences);
    } else {
      member.contactPreferences = {
        donations: true
      };
    }

    try {
      member.gdpr = JSON.parse(member.gdpr);
    } catch (err) {
      member.gdpr = {};
    }

    try {
      member.current_exp_membership = moment(
        member.current_exp_membership
      ).format("L");
      if (member.current_exp_membership == "01/01/9999") {
        member.current_exp_membership = "never";
      }
      member.current_init_membership = moment(
        member.current_init_membership
      ).format("L");
      member.earliest_membership_date = moment(
        member.earliest_membership_date
      ).format("L");
    } catch (err) {}

    async.each(
      member.roles,
      function(role, callback) {
        if (user.allVolunteerRoles) {
          try {
            if (user.allVolunteerRoles[role]) {
              member.working_groups.push(user.allVolunteerRoles[role].group_id);
            }
          } catch (err) {
            member.working_groups = [user.allVolunteerRoles[role].group_id];
          }
        }
        callback();
      },
      function() {
        member.working_groups = Array.from(new Set(member.working_groups));

        var commonWorkingGroup = Helpers.hasOneInCommon(
          member.working_groups,
          user.working_groups
        );

        try {
          if (
            user.permissions.members.name == true ||
            (user.permissions.members.name == "commonWorkingGroup" &&
              commonWorkingGroup)
          ) {
            sanitizedMember.first_name = member.first_name;
            sanitizedMember.last_name = member.last_name;
            sanitizedMember.name = member.first_name + " " + member.last_name;
          }
        } catch (err) {}

        try {
          if (
            user.permissions.members.membershipDates == true ||
            (user.permissions.members.membershipDates == "commonWorkingGroup" &&
              commonWorkingGroup)
          ) {
            sanitizedMember.current_exp_membership =
              member.current_exp_membership;
            sanitizedMember.current_init_membership =
              member.current_init_membership;
            sanitizedMember.earliest_membership_date =
              member.earliest_membership_date;
          }
        } catch (err) {}

        try {
          if (
            user.permissions.members.contactDetails == true ||
            (user.permissions.members.contactDetails == "commonWorkingGroup" &&
              commonWorkingGroup)
          ) {
            sanitizedMember.email = member.email;
            sanitizedMember.phone_no = member.phone_no;
            sanitizedMember.address = member.address;
          }
        } catch (err) {}

        try {
          if (
            user.permissions.members.balance == true ||
            (user.permissions.members.balance == "commonWorkingGroup" &&
              commonWorkingGroup)
          ) {
            sanitizedMember.balance = member.balance;
          }
        } catch (err) {}

        try {
          if (
            user.permissions.members.workingGroups == true ||
            (user.permissions.members.workingGroups == "commonWorkingGroup" &&
              commonWorkingGroup)
          ) {
            sanitizedMember.working_groups = member.working_groups;
          }
        } catch (err) {}

        try {
          if (
            user.permissions.members.carbonSaved == true ||
            (user.permissions.members.carbonSaved == "commonWorkingGroup" &&
              commonWorkingGroup)
          ) {
            sanitizedMember.canViewSavedCarbon = true;
          }
        } catch (err) {}

        try {
          if (
            user.permissions.members.transactionHistory == true ||
            (user.permissions.members.transactionHistory ==
              "commonWorkingGroup" &&
              commonWorkingGroup)
          ) {
            sanitizedMember.transactionHistory = true;
          }
        } catch (err) {}

        try {
          if (
            user.permissions.volunteers.view == true ||
            (user.permissions.volunteers.view == "commonWorkingGroup" &&
              commonWorkingGroup &&
              member.volunteer_id)
          ) {
            sanitizedMember.volunteer_id = member.volunteer_id;
          }
        } catch (err) {}

        try {
          if (
            user.permissions.members.update == true ||
            (user.permissions.members.update == "commonWorkingGroup" &&
              commonWorkingGroup)
          ) {
            sanitizedMember.canUpdate = true;
          }
        } catch (err) {}

        try {
          if (
            user.permissions.members.canRevokeMembership == true ||
            (user.permissions.members.canRevokeMembership ==
              "commonWorkingGroup" &&
              commonWorkingGroup)
          ) {
            sanitizedMember.canRevokeMembership = true;
          }
        } catch (err) {}
        try {
          if (
            user.permissions.members.delete == true ||
            (user.permissions.members.delete == "commonWorkingGroup" &&
              commonWorkingGroup)
          ) {
            sanitizedMember.canDelete = true;
          }
        } catch (err) {}
        try {
          if (
            user.permissions.members.manageMembershipCard == true ||
            (user.permissions.members.manageMembershipCard ==
              "commonWorkingGroup" &&
              commonWorkingGroup)
          ) {
            sanitizedMember.canManageMembershipCard = true;
          }
        } catch (err) {}

        if (Object.keys(sanitizedMember).length > 0) {
          if (member.activeVolunteer) {
            sanitizedMember.activeVolunteer = true;
          }
          sanitizedMember.member_id = member.member_id;
          sanitizedMember.is_member = member.is_member;
          sanitizedMember.free = member.free;
          sanitizedMember.gdpr = member.gdpr;
          sanitizedMember.contactPreferences = member.contactPreferences;
        } else {
          sanitizedMember = null;
        }

        callback(null, sanitizedMember);
      }
    );
  } else {
    callback(null, null);
  }
};

Members.getAll = function(callback) {
  var query = `SELECT * FROM members
                  LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles
                  FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
                  ORDER BY first_name ASC LIMIT 1000000`;
  con.query(query).then(function() {
    var membersObj = {};
    async.each(
      members,
      function(member, callback) {
        membersObj[member.member_id] = member;
        callback();
      },
      function() {
        callback(err, members, membersObj);
      }
    );
  });
};

Members.getTotals = function(callback) {
  var query = `SELECT
  (SELECT count(*) FROM members WHERE first_name != '[redacted]') AS members,
  (SELECT count(*) FROM members WHERE is_member = 1) AS current_members,
  (SELECT COUNT(*) FROM members WHERE is_member = 0) AS expired_members,
  (SELECT COUNT(*) FROM volunteer_info) as volunteers`;
  con
    .query(query)
    .then(function(totals) {
      callback(null, totals);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Members.getAllCurrentMembers = function(callback) {
  Members.findAll({ where: { is_member: 1 } })
    .then(function(members) {
      callback(null, members);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Members.getSignUpInfo = function(callback) {
  Settings.getAll(function(err, settings) {
    callback(
      settings.ourVision,
      settings.saferSpacesPolicy,
      settings.membershipBenefits,
      settings.privacyNotice
    );
  });
};

Members.updateContactPreferences = function(
  member_id,
  contactPreferences,
  callback
) {
  var query = "UPDATE members SET contactPreferences = ? WHERE member_id = ?";
  delete contactPreferences.newsletters;

  Members.update(
    { contactPreferences: JSON.stringify(contactPreferences) },
    { where: { member_id: member_id } }
  )
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

Members.searchByName = function(search, callback) {
  var query = `SELECT * FROM members
    LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles
    FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
    WHERE (CONCAT(first_name, ' ', last_name) LIKE ? OR barcode = ? OR member_id = ?) AND first_name != '[redacted]'
    ORDER BY first_name ASC LIMIT 3`;
  var inserts = ["%" + search + "%", search, search];

  var sql = mysql.format(query, inserts);

  con
    .query(sql)
    .then(function(members) {
      callback(null, members);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Members.searchByNameAndEmail = function(info, callback) {
  var query =
    "SELECT * FROM members WHERE (CONCAT(first_name, ' ', last_name) LIKE ?) AND email = ?";
  var inserts = ["%" + info.name + "%", info.email];

  var sql = mysql.format(query, inserts);

  con
    .query(sql)
    .then(function(members) {
      callback(null, members);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Members.searchByNameAndGroup = function(search, group_id, callback) {
  var query =
    "SELECT * FROM members " +
    "WHERE (CONCAT(first_name, ' ', last_name) LIKE ?) AND first_name != '[redacted]' " +
    "AND working_groups LIKE ?" +
    "ORDER BY first_name ASC LIMIT 3";
  var inserts = ["%" + search + "%", "%" + group_id + "%"];

  var sql = mysql.format(query, inserts);
  con
    .query(sql)
    .then(function(members) {
      callback(null, members);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Members.getById = function(id, user, callback) {
  var query = `SELECT * FROM members
                LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles
                FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
                WHERE members.member_id = ?`;
  var inserts = [id];
  var sql = mysql.format(query, inserts);

  con
    .query(sql)
    .then(function(member) {
      if (member[0]) {
        Members.sanitizeMember(member[0], user, callback);
      } else {
        callback(null, null);
      }
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Members.getMembersWhoJoinedToday = function(callback) {
  Members.findAll({
    where: {
      current_init_membership: moment().format("YYYY-MM-DD"),
      earliest_membership_date: moment().format("YYYY-MM-DD")
    }
  })
    .then(function(members) {
      callback(null, members);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Members.getByEmail = function(email, callback) {
  var query = `SELECT * FROM members
                LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles
                FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
                WHERE members.email = ?`;
  var inserts = [email];
  var sql = mysql.format(query, inserts);

  con
    .query(sql)
    .then(function(member) {
      callback(null, member);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Members.add = function(member, callback) {
  Helpers.uniqueIntId(11, "members", "member_id", function(id) {
    member.member_id = id;

    Members.create({
      member_id: member.member_id,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone_no: member.phone_no,
      address: member.address,
      is_member: 1,
      free: member.free,
      balance: 0,
      earliest_membership_date: member.earliest_membership_date,
      current_init_membership: member.current_init_membership,
      current_exp_membership: member.current_exp_membership
    })
      .then(function() {
        callback(null, member.member_id);
      })
      .catch(function(err) {
        callback(err, null);
      });
  });
};

Members.updateFreeStatus = function(member_id, free, callback) {
  var query = "UPDATE members SET free = ? WHERE member_id = ?";
  Members.update({ free: free }, { where: { member_id: member_id } })
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

Members.getMembershipsExpiringToday = function(callback) {
  var query =
    "SELECT * FROM members WHERE is_member = 1 AND current_exp_membership = CURDATE()";
  con.query(query, callback);
  Members.findAll({
    where: {
      is_member: 1,
      current_exp_membership: moment().format("YYYY-MM-DD")
    }
  });
};

Members.getExpired = function(callback) {
  Members.findAll({
    where: {
      is_member: 1,
      [Op.lte]: { current_exp_membership: moment().format("YYYY-MM-DD") }
    }
  })
    .then(function(members) {
      callback(null, members);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Members.getExpiredTwoYearsAgo = function(callback) {
  var query =
    "SELECT * FROM members WHERE current_exp_membership <= DATE_SUB(CURDATE(), INTERVAL 2 YEAR) AND first_name != '[redacted]'";
  Members.findAll({
    where: {
      is_member: 1,
      current_exp_membership: { [Op.lte]: moment().format("YYYY-MM-DD") },
      first_name: { [Op.not]: "[redacted]" }
    }
  })
    .then(function(members) {
      callback(null, members);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Members.updateBalance = function(member_id, new_balance, callback) {
  Members.update({ balance: balance }, { where: { member_id: member_id } })
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

Members.updateStatus = function(member_id, state, callback) {
  Members.update({ is_member: state }, { where: { member_id: member_id } })
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

Members.updateWorkingGroups = function(
  member_id,
  new_working_groups,
  callback
) {
  Members.update(
    { working_groups: working_groups },
    { where: { member_id: member_id } }
  )
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

Members.updateBarcode = function(member_id, barcode, callback) {
  Members.update({ barcode: barcode }, { where: { member_id: member_id } })
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

Members.redact = function(member_id, callback) {
  var query =
    "UPDATE members SET first_name = '[redacted]', last_name = '[redacted]', email = '[redacted]', phone_no = '[redacted]', address = '[redacted]', working_groups = '[]', is_member = 0 WHERE member_id = ?; DELETE FROM volunteer_info WHERE member_id = ?";
  var inserts = [member_id, member_id];
  var sql = mysql.format(query, inserts);

  con
    .query(sql)
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

Members.updateBasic = function(member, callback) {
  Members.update(
    {
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone_no: member.phone_no,
      address: member.address
    },
    { where: { member_id: member_id } }
  )
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

Members.renew = function(member_id, length, callback) {
  Members.getById(
    member_id,
    { permissions: { members: { membershipDates: true } } },
    function(err, member) {
      if (length == "full_year") {
        member.current_init_membership = moment().format("YYYY-MM-DD");
        member.current_exp_membership = moment()
          .add(12, "months")
          .format("YYYY-MM-DD");
      } else if (length == "half_year") {
        member.current_init_membership = moment().format("YYYY-MM-DD");
        member.current_exp_membership = moment()
          .add(6, "months")
          .format("YYYY-MM-DD");
      } else if (length == "3_months") {
        member.current_init_membership = moment().format("YYYY-MM-DD");
        member.current_exp_membership = moment()
          .add(3, "months")
          .format("YYYY-MM-DD");
      }

      Members.update(
        {
          current_init_membership: member.current_init_membership,
          current_exp_membership: member.current_exp_membership,
          is_member: 1
        },
        { where: { member_id: member_id } }
      )
        .then(function() {
          callback(null);
        })
        .catch(function(err) {
          callback(err);
        });
    }
  );
};

Members.updateExpiryDate = function(member_id, date, callback) {
  Members.update(
    { current_exp_membership: date },
    { where: { member_id: member_id } }
  )
    .then(function() {
      if (moment(date).isBefore(moment())) {
        Members.updateStatus(member_id, 0, function() {});
      } else {
        Members.updateStatus(member_id, 1, function() {});
      }
      callback(null);
    })
    .catch(function(err) {
      callback(err, null);
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

  con
    .query(sql)
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

module.exports = Members;
