/* jshint indent: 2 */

var con;
var mysql = require("mysql");

var FoodCollectionsOrganisations = function(sequelize, DataTypes) {
  con = sequelize;
  return sequelize.define(
    "food_collections_organisations",
    {
      organisation_id: {
        type: DataTypes.STRING(15),
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      active: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "1"
      }
    },
    {
      tableName: "food_collections_organisations"
    }
  );
};

FoodCollectionsOrganisations.getAll = function(callback) {
  var query =
    "SELECT * FROM fs_organisations LEFT JOIN (SELECT organisation_id collections_organisation_id, MAX(timestamp) lastCollection FROM food_collections GROUP BY organisation_id) collections ON fs_organisations.organisation_id=collections.collections_organisation_id ORDER BY fs_organisations.active DESC";

  con
    .query(query)
    .then(function() {
      var organisationsObj = {};
      async.each(
        organisations,
        function(organisation, callback) {
          organisationsObj[organisation.organisation_id] = organisation;
          callback();
        },
        function() {
          callback(null, organisationsObj);
        }
      );
    })
    .catch(function(err) {
      callback(err, null);
    });
};

FoodCollectionsOrganisations.getById = function(organisation_id, callback) {
  var query =
    "SELECT * FROM fs_organisations LEFT JOIN (SELECT organisation_id collections_organisation_id, MAX(timestamp) lastCollection FROM food_collections GROUP BY organisation_id) collections ON fs_organisations.organisation_id=collections.collections_organisation_id WHERE fs_organisations.organisation_id = ?";
  var inserts = [organisation_id];
  var sql = mysql.format(query, inserts);
  con
    .query(sql)
    .then(function(organisation) {
      if (organisation[0]) {
        callback(null, organisation[0]);
      } else {
        callback(null, null);
      }
    })
    .catch(function(err) {
      callback(err, null);
    });
};

FoodCollectionsOrganisations.add = function(organisation, callback) {
  var query =
    "INSERT INTO fs_organisations (organisation_id, name, dateCreated) VALUES (?,?,?)";
  Helpers.uniqueBase64Id(15, "fs_organisations", "organisation_id", function(
    organisation_id
  ) {
    FoodCollectionsOrganisations.create({
      organisation_id: organisation_id,
      name: organisation.name,
      dateCreated: new Date()
    })
      .then(function() {
        callback(null, organisation_id);
      })
      .catch(function(err) {
        callback(err, null);
      });
  });
};

FoodCollectionsOrganisations.updateOrganisation = function(
  organisation,
  callback
) {
  FoodCollectionsOrganisations.update(
    { name: organisation.name },
    { where: { organisation_id: organisation.organisation_id } }
  )
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

FoodCollectionsOrganisations.updateActiveStatus = function(
  organisation_id,
  active,
  callback
) {
  FoodCollectionsOrganisations.update(
    { active: active },
    { where: { organisation_id: organisation_id } }
  )
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

FoodCollectionsOrganisations.deleteOrganisation = function(
  organisation_id,
  callback
) {
  FoodCollectionsOrganisations.update(
    { active: 0 },
    { where: { organisation_id: organisation_id } }
  )
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

module.exports = FoodCollectionsOrganisations;
