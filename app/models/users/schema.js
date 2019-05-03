/* jshint indent: 2 */

var con;
var bcrypt = require("bcrypt-nodejs");
var async = require("async");
var mysql = require("mysql");
var lodash = require("lodash");
var moment = require("moment");
moment.locale("en-gb");

var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");

module.exports = function(sequelize, DataTypes) {
  con = sequelize;
  var Users = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.STRING(11),
        allowNull: false,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      class: {
        type: DataTypes.STRING(25),
        allowNull: false
      },
      working_groups: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      notification_preferences: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      deactivated: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0"
      }
    },
    {
      tableName: "users",
      timestamps: false
    }
  );
  Users.getAll = require("./methods/getAll")(Users, sequelize, DataTypes);

  Users.getByUsername = require("./methods/getByUsername")(
    Users,
    sequelize,
    DataTypes
  );

  Users.getCoordinators = require("./methods/getCoordinators")(
    Users,
    sequelize,
    DataTypes
  );

  Users.getByUsernameOrEmail = require("./methods/getByUsernameOrEmail")(
    Users,
    sequelize,
    DataTypes
  );

  Users.getByEmail = require("./methods/getByEmail")(
    Users,
    sequelize,
    DataTypes
  );

  Users.getById = require("./methods/getById")(Users, sequelize, DataTypes);

  Users.sanitizeUser = require("./methods/sanitizeUser")(
    Users,
    sequelize,
    DataTypes
  );

  Users.comparePassword = require("./methods/comparePassword")(
    Users,
    sequelize,
    DataTypes
  );

  Users.updateWorkingGroups = require("./methods/updateWorkingGroups")(
    Users,
    sequelize,
    DataTypes
  );

  Users.add = require("./methods/add")(Users, sequelize, DataTypes);

  Users.updateUser = require("./methods/updateUser")(
    Users,
    sequelize,
    DataTypes
  );

  Users.updatePassword = require("./methods/updatePassword")(
    Users,
    sequelize,
    DataTypes
  );

  Users.deactivate = require("./methods/deactivate")(
    Users,
    sequelize,
    DataTypes
  );
  return Users;
};
