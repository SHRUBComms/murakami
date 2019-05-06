/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Members = sequelize.define(
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
      tableName: "members",
      timestamps: false
    }
  );

  Members.generateId = require("./methods/generateId")(
    Members,
    sequelize,
    DataTypes
  );

  Members.sanitizeMember = require("./methods/sanitizeMember")(
    Members,
    sequelize,
    DataTypes
  );

  Members.getAll = require("./methods/getAll")(Members, sequelize, DataTypes);

  Members.getTotals = function(callback) {
    var query = `SELECT
    (SELECT count(*) FROM members WHERE first_name != '[redacted]') AS members,
    (SELECT count(*) FROM members WHERE is_member = 1) AS current_members,
    (SELECT COUNT(*) FROM members WHERE is_member = 0) AS expired_members,
    (SELECT COUNT(*) FROM volunteer_info) as volunteers`;
    sequelize.query(query).nodeify(function(err, totals) {
      callback(err, totals);
    });
  };

  Members.getAllCurrentMembers = function(callback) {
    Members.findAll({ where: { is_member: 1 } }).nodeify(function(
      err,
      members
    ) {
      callback(err, members);
    });
  };

  Members.updateContactPreferences = function(
    member_id,
    contactPreferences,
    callback
  ) {
    delete contactPreferences.newsletters;

    Members.update(
      { contactPreferences: JSON.stringify(contactPreferences) },
      { where: { member_id: member_id } }
    ).nodeify(callback);
  };

  Members.searchByName = function(search, callback) {
    var query = `SELECT * FROM members
      LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles
      FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
      WHERE (CONCAT(first_name, ' ', last_name) LIKE ? OR barcode = ? OR member_id = ?) AND first_name != '[redacted]'
      ORDER BY first_name ASC LIMIT 3`;
    var inserts = ["%" + search + "%", search, search];

    var sql = mysql.format(query, inserts);

    sequelize.query(sql);
    nodeify(function(err, members) {
      callback(err, members);
    });
  };

  Members.searchByNameAndEmail = function(info, callback) {
    var query =
      "SELECT * FROM members WHERE (CONCAT(first_name, ' ', last_name) LIKE ?) AND email = ?";
    var inserts = ["%" + info.name + "%", info.email];

    var sql = mysql.format(query, inserts);

    sequelize.query(sql);
    nodeify(function(err, members) {
      callback(err, members);
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
    sequelize.query(sql);
    nodeify(callback);
  };

  Members.getById = require("./methods/getById")(Members, sequelize, DataTypes);

  Members.getMembersWhoJoinedToday = function(callback) {
    Members.findAll({
      where: {
        current_init_membership: moment().format("YYYY-MM-DD"),
        earliest_membership_date: moment().format("YYYY-MM-DD")
      }
    });
    nodeify(function(members) {
      callback(null, members);
    }).catch(function(err) {
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

    sequelize.query(sql);
    nodeify(function(member) {
      callback(null, member);
    }).catch(function(err) {
      callback(err, null);
    });
  };

  Members.add = require("./methods/add")(Members, sequelize, DataTypes);

  Members.updateFreeStatus = function(member_id, free, callback) {
    var query = "UPDATE members SET free = ? WHERE member_id = ?";
    Members.update({ free: free }, { where: { member_id: member_id } });
    nodeify(function(err) {
      callback(null);
    }).catch(function(err) {
      callback(err);
    });
  };

  Members.getMembershipsExpiringToday = function(callback) {
    var query =
      "SELECT * FROM members WHERE is_member = 1 AND current_exp_membership = CURDATE()";
    sequelize.query(query, callback);
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
    });
    nodeify(function(members) {
      callback(null, members);
    }).catch(function(err) {
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
    });
    nodeify(function(members) {
      callback(null, members);
    }).catch(function(err) {
      callback(err, null);
    });
  };

  Members.updateBalance = function(member_id, new_balance, callback) {
    Members.update({ balance: balance }, { where: { member_id: member_id } });
    nodeify(function(err) {
      callback(null);
    }).catch(function(err) {
      callback(err);
    });
  };

  Members.updateStatus = function(member_id, state, callback) {
    Members.update({ is_member: state }, { where: { member_id: member_id } });
    nodeify(function(err) {
      callback(null);
    }).catch(function(err) {
      callback(err);
    });
  };

  Members.updateWorkingGroups = function(
    member_id,
    new_working_groups,
    callback
  ) {
    Members.update(
      { working_groups: new_working_groups },
      { where: { member_id: member_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };

  Members.updateBarcode = function(member_id, barcode, callback) {
    Members.update({ barcode: barcode }, { where: { member_id: member_id } });
    nodeify(function(err) {
      callback(null);
    }).catch(function(err) {
      callback(err);
    });
  };

  Members.redact = function(member_id, callback) {
    var query =
      "UPDATE members SET first_name = '[redacted]', last_name = '[redacted]', email = '[redacted]', phone_no = '[redacted]', address = '[redacted]', working_groups = '[]', is_member = 0 WHERE member_id = ?; DELETE FROM volunteer_info WHERE member_id = ?";
    var inserts = [member_id, member_id];
    var sql = mysql.format(query, inserts);

    sequelize.query(sql);
    nodeify(function(err) {
      callback(null);
    }).catch(function(err) {
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
      { where: { member_id: member.member_id } }
    ).nodeify(function(err) {
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
        );
        nodeify(function(err) {
          callback(null);
        }).catch(function(err) {
          callback(err);
        });
      }
    );
  };

  Members.updateExpiryDate = function(member_id, date, callback) {
    Members.update(
      { current_exp_membership: date },
      { where: { member_id: member_id } }
    );
    nodeify(function(err) {
      if (moment(date).isBefore(moment())) {
        Members.updateStatus(member_id, 0, function() {});
      } else {
        Members.updateStatus(member_id, 1, function() {});
      }
      callback(null);
    }).catch(function(err) {
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

    sequelize.query(sql);
    nodeify(function(err) {
      callback(err);
    });
  };

  return Members;
};
