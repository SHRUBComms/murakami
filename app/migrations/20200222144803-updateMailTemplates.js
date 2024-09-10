module.exports = {
  up: (queryInterface, DataTypes) => {
    return Promise.all([
      queryInterface.changeColumn("mail_templates", "mail_desc", {
        type: DataTypes.STRING(100),
        allowNull: false,
      }),

      queryInterface.addColumn("mail_templates", "long_description", {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "Long description.",
      }),
      queryInterface.addColumn("mail_templates", "category", {
        type: DataTypes.STRING(15),
        allowNull: false,
      }),
      queryInterface.renameColumn("mail_templates", "mail_desc", "short_description"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("mail_templates", "short_description", {
        type: DataTypes.TEXT,
        allowNull: false,
      }),

      queryInterface.removeColumn("mail_templates", "long_description"),
      queryInterface.removeColumn("mail_templates", "category"),
      queryInterface.renameColumn("mail_templates", "short_description", "mail_desc"),
    ]);
  },
};
