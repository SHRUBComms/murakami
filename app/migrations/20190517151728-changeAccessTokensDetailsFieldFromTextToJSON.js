"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("access_tokens", "details", {
        type: Sequelize.JSON,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.changeColumn("access_tokens", "details", {
      type: Sequelize.TEXT,
    });
  },
};
