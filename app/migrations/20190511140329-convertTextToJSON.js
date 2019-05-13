module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("carbon", "trans_object", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("carbon_categories", "factors", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("data_permissions", "permissions", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("members", "contactPreferences", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("members", "working_groups", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("reports", "report", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("settings", "data", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("transactions", "summary", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("users", "working_groups", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("users", "notification_preferences", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("volunteer_checkins", "questionnaire", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("volunteer_roles", "availability", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("volunteer_roles", "details", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("volunteer_info", "roles", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("volunteer_info", "assignedCoordinators", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("volunteer_info", "survey", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("volunteer_info", "availability", {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn("volunteer_info", "gdpr", {
        type: Sequelize.JSON
      })
    ]);
  },

  down: (queryInterface, Sequelize) => []
};
