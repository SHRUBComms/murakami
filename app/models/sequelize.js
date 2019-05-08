var Sequelize = require("sequelize");

if (process.env.NODE_ENV == "production") {
  process.env.DB_HOST = process.env.PROD_DB_HOST;
  process.env.DB_NAME = process.env.PROD_DB_NAME;
  process.env.DB_USER = process.env.PROD_DB_USER;
  process.env.DB_PASS = process.env.PROD_DB_PASS;
} else if (process.env.NODE_ENV == "testing") {
  process.env.DB_HOST = process.env.TEST_DB_HOST;
  process.env.DB_NAME = process.env.TEST_DB_NAME;
  process.env.DB_USER = process.env.TEST_DB_USER;
  process.env.DB_PASS = process.env.TEST_DB_PASS;
} else {
  process.env.DB_HOST = process.env.DEV_DB_HOST;
  process.env.DB_NAME = process.env.DEV_DB_NAME;
  process.env.DB_USER = process.env.DEV_DB_USER;
  process.env.DB_PASS = process.env.DEV_DB_PASS;
}

var sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    timestamps: false
  }
);

sequelize
  .authenticate()
  .then(function() {})
  .catch(function(err) {
    console.error("Unable to connect to the database:", err);
  });

/*Helpers.includeAllModelMethods(
    Users,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/users/methods/",
    function(Users) {}
  );*/

var rootDir = process.env.CWD;

var Models = {
  sequelize: sequelize,
  AccessTokens: require(rootDir + "/app/models/access_tokens/schema")(
    sequelize,
    Sequelize
  ),
  Attempts: require(rootDir + "/app/models/attempts/schema")(
    sequelize,
    Sequelize
  ),
  CarbonCategories: require(rootDir + "/app/models/carbon_categories/schema")(
    sequelize,
    Sequelize
  ),
  Carbon: require(rootDir + "/app/models/carbon/schema")(sequelize, Sequelize),
  DataPermissions: require(rootDir + "/app/models/data_permissions/schema")(
    sequelize,
    Sequelize
  ),
  FoodCollectionsOrganisations: require(rootDir +
    "/app/models/food_collections_organisations/schema")(sequelize, Sequelize),
  FoodCollections: require(rootDir + "/app/models/food_collections/schema")(
    sequelize,
    Sequelize
  ),
  MailTemplates: require(rootDir + "/app/models/mail_templates/schema")(
    sequelize,
    Sequelize
  ),
  Members: require(rootDir + "/app/models/members/schema")(
    sequelize,
    Sequelize
  ),
  PasswordReset: require(rootDir + "/app/models/password_reset/schema")(
    sequelize,
    Sequelize
  ),
  Reports: require(rootDir + "/app/models/reports/schema")(
    sequelize,
    Sequelize
  ),
  Settings: require(rootDir + "/app/models/settings/schema")(
    sequelize,
    Sequelize
  ),
  StockCategories: require(rootDir + "/app/models/stock_categories/schema")(
    sequelize,
    Sequelize
  ),
  TillActivity: require(rootDir + "/app/models/till_activity/schema")(
    sequelize,
    Sequelize
  ),
  Tills: require(rootDir + "/app/models/tills/schema")(sequelize, Sequelize),
  Transactions: require(rootDir + "/app/models/transactions/schema")(
    sequelize,
    Sequelize
  ),
  Users: require(rootDir + "/app/models/users/schema")(sequelize, Sequelize),
  VolunteerCheckIns: require(rootDir + "/app/models/volunteer_checkins/schema")(
    sequelize,
    Sequelize
  ),
  VolunteerHours: require(rootDir + "/app/models/volunteer_hours/schema")(
    sequelize,
    Sequelize
  ),
  VolunteerRoles: require(rootDir + "/app/models/volunteer_roles/schema")(
    sequelize,
    Sequelize
  ),
  Volunteers: require(rootDir + "/app/models/volunteers/schema")(
    sequelize,
    Sequelize
  ),
  WorkingGroups: require(rootDir + "/app/models/working_groups/schema")(
    sequelize,
    Sequelize
  )
};

Models.Volunteers.getSignUpInfo = function(callback) {
  Models.VolunteerRoles.getAll(function(
    err,
    roles,
    rolesGroupedByGroup,
    rolesGroupedById
  ) {
    Models.Settings.getAll(function(err, settings) {
      callback(
        settings.activities,
        settings.contactMethods,
        roles,
        rolesGroupedByGroup,
        rolesGroupedById,
        settings.volunteerAgreement,
        settings.ourVision,
        settings.saferSpacesPolicy,
        settings.membershipBenefits,
        settings.privacyNotice
      );
    });
  });
};

Models.Members.getSignUpInfo = function(callback) {
  Models.Settings.getAll(function(err, settings) {
    callback(
      settings.ourVision,
      settings.saferSpacesPolicy,
      settings.membershipBenefits,
      settings.privacyNotice
    );
  });
};

Models.VolunteerRoles.getRoleSignUpInfo = function(callback) {
  Models.Settings.getAll(function(err, settings) {
    callback(
      settings.locations,
      settings.activities,
      settings.commitmentLengths
    );
  });
};

module.exports = Models;
