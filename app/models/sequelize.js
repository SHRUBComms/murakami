const Sequelize = require("sequelize");
const bluebird = require("bluebird");

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

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: false,
  timestamps: false,
});

async () => {
  const dbError = await sequelize.authenticate();
  if (!dbError) {
    console.log("Connected to database successfully!");
  } else {
    console.error("Unable to connect to the database:", err);
  }
};

const rootDir = process.env.CWD;

const Models = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  AccessTokens: require(rootDir + "/app/models/access_tokens/schema")(sequelize, Sequelize),
  Activity: require(rootDir + "/app/models/activity/schema")(sequelize, Sequelize),
  CarbonCategories: require(rootDir + "/app/models/carbon_categories/schema")(sequelize, Sequelize),
  Carbon: require(rootDir + "/app/models/carbon/schema")(sequelize, Sequelize),
  DataPermissions: require(rootDir + "/app/models/data_permissions/schema")(sequelize, Sequelize),
  FoodCollectionsKeys: require(rootDir + "/app/models/food_collections_keys/schema")(
    sequelize,
    Sequelize
  ),
  FoodCollectionsOrganisations: require(
    rootDir + "/app/models/food_collections_organisations/schema"
  )(sequelize, Sequelize),
  FoodCollections: require(rootDir + "/app/models/food_collections/schema")(sequelize, Sequelize),
  MailTemplates: require(rootDir + "/app/models/mail_templates/schema")(sequelize, Sequelize),
  Members: require(rootDir + "/app/models/members/schema")(sequelize, Sequelize),
  PasswordReset: require(rootDir + "/app/models/password_reset/schema")(sequelize, Sequelize),
  Reports: require(rootDir + "/app/models/reports/schema")(sequelize, Sequelize),
  Settings: require(rootDir + "/app/models/settings/schema")(sequelize, Sequelize),
  StockCategories: require(rootDir + "/app/models/stock_categories/schema")(sequelize, Sequelize),
  StockRecords: require(rootDir + "/app/models/stock_records/schema")(sequelize, Sequelize),
  TillActivity: require(rootDir + "/app/models/till_activity/schema")(sequelize, Sequelize),
  Tills: require(rootDir + "/app/models/tills/schema")(sequelize, Sequelize),
  Transactions: require(rootDir + "/app/models/transactions/schema")(sequelize, Sequelize),
  Users: require(rootDir + "/app/models/users/schema")(sequelize, Sequelize),
  VolunteerCheckIns: require(rootDir + "/app/models/volunteer_checkins/schema")(
    sequelize,
    Sequelize
  ),
  VolunteerHours: require(rootDir + "/app/models/volunteer_hours/schema")(sequelize, Sequelize),
  VolunteerRoles: require(rootDir + "/app/models/volunteer_roles/schema")(sequelize, Sequelize),
  Volunteers: require(rootDir + "/app/models/volunteers/schema")(sequelize, Sequelize),
  WorkingGroups: require(rootDir + "/app/models/working_groups/schema")(sequelize, Sequelize),
};

require("./additional-methods")(Models);

module.exports = Models;
