var con = require("./index");
var mysql = require("mysql");
var async = require("async");
var sanitizeHtml = require("sanitize-html");

var rootDir = process.env.CWD;

var Helpers = require(rootDir + "/app/configs/helpful_functions");

var Members = require(rootDir + "/app/models/members");

var FoodCollections = {};

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

FoodCollections.getOrganisations = function(callback) {
  var query =
    "SELECT * FROM fs_organisations LEFT JOIN (SELECT organisation_id collections_organisation_id, MAX(timestamp) lastCollection FROM food_collections GROUP BY organisation_id) collections ON fs_organisations.organisation_id=collections.collections_organisation_id ORDER BY fs_organisations.active DESC";

  con.query(query, function(err, organisations) {
    var organisationsObj = {};
    async.each(
      organisations,
      function(organisation, callback) {
        organisationsObj[organisation.organisation_id] = organisation;
        callback();
      },
      function() {
        callback(err, organisationsObj);
      }
    );
  });
};

FoodCollections.getCollectionsBetweenTwoDatesByOrganisation = function(
  organisation_id,
  startDate,
  endDate,
  callback
) {
  var Members = require(rootDir + "/app/models/members");
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
  
  con.query(sql, function(err, collections) {
    if (collections) {
      Members.getAll(function(err, members, membersObj) {
        var sanitizedCollections = [];
        async.each(
          collections,
          function(collection, callback) {
            FoodCollections.sanitizeCollection(collection, membersObj, function(
              sanitizedCollection
            ) {
              
              sanitizedCollections.push(sanitizedCollection);
              callback();
            });
          },
          function() {
            callback(err, sanitizedCollections);
          }
        );
      });
    } else {
      callback(err, null);
    }
  });
};

FoodCollections.getCollectionsByOrganisationId = function(
  organisation_id,
  callback
) {
  var query =
    "SELECT * FROM food_collections WHERE organisation_id = ? AND approved = 1 ORDER BY timestamp DESC";
  var inserts = [organisation_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, function(err, collections) {
    if (collections) {
      Members.getAll(function(err, members, membersObj) {
        var sanitizedCollections = [];
        async.each(
          collections,
          function(collection, callback) {
            FoodCollections.sanitizeCollection(collection, membersObj, function(
              sanitizedCollection
            ) {
              
              sanitizedCollections.push(sanitizedCollection);
              callback();
            });
          },
          function() {
            callback(err, sanitizedCollections);
          }
        );
      });
    } else {
      callback(err, null);
    }
  });
};

FoodCollections.getOrganisationById = function(organisation_id, callback) {
  var query =
    "SELECT * FROM fs_organisations LEFT JOIN (SELECT organisation_id collections_organisation_id, MAX(timestamp) lastCollection FROM food_collections GROUP BY organisation_id) collections ON fs_organisations.organisation_id=collections.collections_organisation_id WHERE fs_organisations.organisation_id = ?";
  var inserts = [organisation_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, function(err, organisation) {
    if (organisation[0]) {
      callback(err, organisation[0]);
    } else {
      callback(err, null);
    }
  });
};

FoodCollections.addOrganisation = function(organisation, callback) {
  var query =
    "INSERT INTO fs_organisations (organisation_id, name, dateCreated) VALUES (?,?,?)";
  Helpers.uniqueBase64Id(15, "fs_organisations", "organisation_id", function(
    organisation_id
  ) {
    var inserts = [organisation_id, organisation.name, new Date()];
    var sql = mysql.format(query, inserts);
    con.query(sql, function(err) {
      callback(err, organisation_id);
    });
  });
};

FoodCollections.getUnreviewedCollections = function(callback) {
  var query = "SELECT * FROM food_collections WHERE approved IS NULL";
  con.query(query, callback);
};

FoodCollections.getCollectionById = function(transaction_id, callback) {
  var query = "SELECT * FROM food_collections WHERE transaction_id = ?";
  var inserts = [transaction_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, function(err, collection) {
    if (collection[0]) {
      callback(err, collection[0]);
    } else {
      callback(err, null);
    }
  });
};

FoodCollections.approveCollection = function(transaction_id, callback) {
  var query =
    "UPDATE food_collections SET approved = 1 WHERE transaction_id = ?";
  var inserts = [transaction_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

FoodCollections.denyCollection = function(transaction_id, callback) {
  var query =
    "UPDATE food_collections SET approved = 0 WHERE transaction_id = ?";
  var inserts = [transaction_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

FoodCollections.updateOrganisation = function(organisation, callback) {
  var query = "UPDATE fs_organisations SET name = ? WHERE organisation_id = ?";

  var inserts = [organisation.name, organisation.organisation_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

FoodCollections.updateOrganisationActiveStatus = function(
  organisation_id,
  active,
  callback
) {
  var query =
    "UPDATE fs_organisations SET active = ? WHERE organisation_id = ?";

  var inserts = [active, organisation_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

FoodCollections.deleteOrganisation = function(organisation_id, callback) {
  var query =
    "UPDATE fs_organisations SET active = 0 WHERE organisation_id = ?";

  var inserts = [organisation_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

FoodCollections.add = function(
  member_id,
  organisation_id,
  amount,
  note,
  approved,
  callback
) {
  var query =
    "INSERT INTO food_collections (transaction_id, member_id, organisation_id, amount, note, timestamp, approved) VALUES (?,?,?,?,?,?,?)";
  Helpers.uniqueBase64Id(15, "food_collections", "transaction_id", function(
    transaction_id
  ) {
    var inserts = [
      transaction_id,
      member_id,
      organisation_id,
      amount,
      note || null,
      new Date(),
      approved
    ];
    var sql = mysql.format(query, inserts);
    con.query(sql, callback);
  });
};

module.exports = FoodCollections;
