module.exports = {
  up: (queryInterface, DataTypes) => {
    return Promise.all([
      queryInterface.createTable('membership_subscription', {
	      subscription_id: {
          type: DataTypes.STRING(11),
          allowNull: false,
          primaryKey: true
        },
        member_id: {
          type: DataTypes.STRING(11),
          allowNull: false,
          references: {
            model: 'members',
            key: 'member_id'
          },
        },
        subscription_type: {
          type: DataTypes.STRING(15),
          allowNull: true,
        },
        is_free: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        subscribed_channel: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        subscription_properties: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        start_datetime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        expiry_datetime: {
          type: DataTypes.DATE,
          allowNull: false,
        }
      }, {
        charset: 'latin1',
        collate: 'latin1_swedish_ci'
      })
    ]);
  },

  down: (queryInterface, DataTypes) => {
    return Promise.all([queryInterface.dropTable('membership_subscription')]);
  },
};