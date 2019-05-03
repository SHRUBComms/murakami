/* jshint indent: 2 */

var mysql = require("mysql");
var con;

var FoodCollections = function(sequelize, DataTypes) {
  con = sequelize;
  return sequelize.define(
    "food_collections",
    {
      transaction_id: {
        type: DataTypes.STRING(15),
        allowNull: false,
        primaryKey: true
      },
      member_id: {
        type: DataTypes.STRING(11),
        allowNull: false
      },
      organisation_id: {
        type: DataTypes.STRING(15),
        allowNull: false
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      amount: {
        type: DataTypes.STRING(5),
        allowNull: false
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      approved: {
        type: DataTypes.INTEGER(4),
        allowNull: true
      }
    },
    {
      tableName: "food_collections"
    }
  );
};

FoodCollections.sanitizeCollection = function(collection, members, callback) {
  if (members[collection.member_id]) {
    collection.collectedBy =
      members[collection.member_id].first_name +
      " " +
      members[collection.member_id].last_name;
  } else {
    collection.collectedBy = "Unknown";
  }

  if (!collection.note) {
    collection.note = "-";
  } else if (collection.note == "null") {
    collection.note = "-";
  } else {
    collection.note = sanitizeHtml(collection.note);
  }

  callback(collection);
};

FoodCollections.getCollectionsBetweenTwoDatesByOrganisation = function(
  organisation_id,
  startDate,
  endDate,
  callback
) {
  var Members = require(rootDir + "/app/models/sequelize").Members;
  var query, inerts, sql;
  if (organisation_id) {
    query =
      "SELECT * FROM food_collections WHERE organisation_id = ? AND approved = 1 AND timestamp >= DATE(?) AND timestamp <= DATE(?) ORDER BY timestamp DESC";
    inserts = [organisation_id, startDate, endDate];
    sql = mysql.format(query, inserts);
  } else {
    query =
      "SELECT * FROM food_collections WHERE approved = 1 AND timestamp >= DATE(?) AND timestamp <= DATE(?) ORDER BY timestamp DESC";
    inserts = [startDate, endDate];
    sql = mysql.format(query, inserts);
  }

  con
    .query(sql)
    .then(function(collections) {
      if (collections) {
        Members.getAll(function(err, members, membersObj) {
          var sanitizedCollections = [];
          async.each(
            collections,
            function(collection, callback) {
              FoodCollections.sanitizeCollection(
                collection,
                membersObj,
                function(sanitizedCollection) {
                  sanitizedCollections.push(sanitizedCollection);
                  callback();
                }
              );
            },
            function() {
              callback(null, sanitizedCollections);
            }
          );
        });
      } else {
        callback(null, null);
      }
    })
    .catch(function(err) {
      callback(err, null);
    });
};

FoodCollections.getCollectionsByOrganisationId = function(
  organisation_id,
  callback
) {
  var Members = require(rootDir + "/app/models/sequelize").Members;
  FoodCollections.findAll({
    where: { organisation_id: organisation_id, approved: 1 },
    order: { timestamp: "DESC" }
  })
    .then(function(collections) {
      if (collections) {
        Members.getAll(function(err, members, membersObj) {
          var sanitizedCollections = [];
          async.each(
            collections,
            function(collection, callback) {
              FoodCollections.sanitizeCollection(
                collection,
                membersObj,
                function(sanitizedCollection) {
                  sanitizedCollections.push(sanitizedCollection);
                  callback();
                }
              );
            },
            function() {
              callback(null, sanitizedCollections);
            }
          );
        });
      } else {
        callback(null, null);
      }
    })
    .catch(function(err) {
      callback(err, null);
    });
};

FoodCollections.getUnreviewedCollections = function(callback) {
  FoodCollections.findAll({ approved: null })
    .then(function(collections) {
      callback(null, collections);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

FoodCollections.getById = function(transaction_id, callback) {
  var query = "SELECT * FROM food_collections WHERE transaction_id = ?";
  var inserts = [transaction_id];
  var sql = mysql.format(query, inserts);
  FoodCollections.findOne({ transaction_id: transaction_id })
    .then(function(collections) {
      if (collection[0]) {
        callback(null, collection[0]);
      } else {
        callback(null, null);
      }
    })
    .catch(function(err) {
      callback(err, null);
    });
};

FoodCollections.approveCollection = function(transaction_id, callback) {
  FoodCollections.update(
    { approved: 1 },
    { where: { transaction_id: transaction_id } }
  )
    .then(function(err) {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

FoodCollections.denyCollection = function(transaction_id, callback) {
  FoodCollections.update(
    { approved: 0 },
    { where: { transaction_id: transaction_id } }
  )
    .then(function(err) {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

FoodCollections.add = function(
  member_id,
  organisation_id,
  amount,
  note,
  approved,
  callback
) {
  Helpers.uniqueBase64Id(15, "food_collections", "transaction_id", function(
    transaction_id
  ) {
    FoodCollections.create({
      transaction_id: transaction_id,
      member_id: member_id,
      organisation_id: organisation_id,
      amount: amount,
      note: note || null,
      timestamp: new Date(),
      approved: approved
    })
      .then(function(err) {
        callback(null, transaction_id);
      })
      .catch(function(err) {
        callback(err, null);
      });
  });
};

module.exports = FoodCollections;
