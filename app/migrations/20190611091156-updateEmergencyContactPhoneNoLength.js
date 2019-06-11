module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("volunteer_info", "emergencyContactPhoneNo", {
        type: Sequelize.STRING(25)
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("volunteer_info", "emergencyContactPhoneNo", {
        type: Sequelize.STRING(15)
      })
    ]);
  }
};
