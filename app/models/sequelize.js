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
  .then(function() {
    console.log("Database connection has been successfully established!");
  })
  .catch(function(err) {
    console.error("Unable to connect to the database:", err);
  });

var rootDir = process.env.CWD;

var AccessTokensModel = require(rootDir + "/app/models/access_tokens/schema");
var ActivityModel = require(rootDir + "/app/models/activity/schema");
var AttemptsModel = require(rootDir + "/app/models/attempts/schema");
var CarbonCategoriesModel = require(rootDir +
  "/app/models/carbon_categories/schema");
var CarbonModel = require(rootDir + "/app/models/carbon/schema");
var DataPermissionsModel = require(rootDir +
  "/app/models/data_permissions/schema");
var FoodCollectionsModel = require(rootDir +
  "/app/models/food_collections/schema");
var FoodCollectionsOrganisationsModel = require(rootDir +
  "/app/models/food_collections_organisations/schema");
var SettingsModel = require(rootDir + "/app/models/settings/schema");
var MailTemplatesModel = require(rootDir + "/app/models/mail_templates/schema");
var MembersModel = require(rootDir + "/app/models/members/schema");
var NotificationsModel = require(rootDir + "/app/models/notifications/schema");
var PasswordResetModel = require(rootDir + "/app/models/password_reset/schema");
var ReportsModel = require(rootDir + "/app/models/reports/schema");
var StockCategoriesModel = require(rootDir +
  "/app/models/stock_categories/schema");
var TillActivityModel = require(rootDir + "/app/models/till_activity/schema");
var TillsModel = require(rootDir + "/app/models/tills/schema");
var TransactionsModel = require(rootDir + "/app/models/transactions/schema");
var UsersModel = require(rootDir + "/app/models/users/schema");
var VolunteerCheckInsModel = require(rootDir +
  "/app/models/volunteer_checkins/schema");
var VolunteerHoursModel = require(rootDir +
  "/app/models/volunteer_hours/schema");
var VolunteerRolesModel = require(rootDir +
  "/app/models/volunteer_roles/schema");
var VolunteersModel = require(rootDir + "/app/models/volunteers/schema");
var WorkingGroupsModel = require(rootDir + "/app/models/working_groups/schema");

var Models = {
  sequelize: sequelize,
  AccessTokens: AccessTokensModel(sequelize, Sequelize),
  Activity: ActivityModel(sequelize, Sequelize),
  Attempts: AttemptsModel(sequelize, Sequelize),
  CarbonCategories: CarbonCategoriesModel(sequelize, Sequelize),
  Carbon: CarbonModel(sequelize, Sequelize),
  DataPermissions: DataPermissionsModel(sequelize, Sequelize),
  FoodCollectionsOrganisations: FoodCollectionsOrganisationsModel(
    sequelize,
    Sequelize
  ),
  FoodCollections: FoodCollectionsModel(sequelize, Sequelize),
  MailTemplates: MailTemplatesModel(sequelize, Sequelize),
  Members: MembersModel(sequelize, Sequelize),
  Notifications: NotificationsModel(sequelize, Sequelize),
  PasswordReset: PasswordResetModel(sequelize, Sequelize),
  Reports: ReportsModel(sequelize, Sequelize),
  Settings: SettingsModel(sequelize, Sequelize),
  StockCategories: StockCategoriesModel(sequelize, Sequelize),
  TillActivity: TillActivityModel(sequelize, Sequelize),
  Tills: TillsModel(sequelize, Sequelize),
  Transactions: TransactionsModel(sequelize, Sequelize),
  Users: UsersModel(sequelize, Sequelize),
  VolunteerCheckIns: VolunteerCheckInsModel(sequelize, Sequelize),
  VolunteerHours: VolunteerHoursModel(sequelize, Sequelize),
  VolunteerRoles: VolunteerRolesModel(sequelize, Sequelize),
  Volunteers: VolunteersModel(sequelize, Sequelize),
  WorkingGroups: WorkingGroupsModel(sequelize, Sequelize)
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

module.exports = Models;
