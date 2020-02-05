module.exports = {
  up: (queryInterface, DataTypes) => {
    return Promise.all([
      queryInterface.createTable("food_collections_keys", {
        member_id: {
          type: DataTypes.STRING(25),
          allowNull: false,
          unique: true
        },
        key: {
          type: DataTypes.STRING(25),
          unique: true,
          primaryKey: true,
          allowNull: false
        },
        organisations: {
          type: DataTypes.JSON,
          allowNull: false
        },
        last_updated: {
          type: DataTypes.DATE,
          allowNull: false
        },
        active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 1
        }
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.dropTable("food_collections_keys")]);
  }
};
