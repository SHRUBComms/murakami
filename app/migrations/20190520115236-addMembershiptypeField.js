"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("members", "membership_type", {
        type: Sequelize.STRING(15),
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn("members", "membership_type");
  },
};
