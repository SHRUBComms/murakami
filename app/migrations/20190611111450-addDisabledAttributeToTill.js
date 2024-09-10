module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("tills", "disabled", {
        type: Sequelize.INTEGER(4),
        allowNull: false,
        defaultValue: 0,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("tills", "disabled")]);
  },
};
