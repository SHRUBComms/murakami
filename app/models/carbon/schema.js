/* jshint indent: 2 */

var Carbon = function(sequelize, DataTypes) {
  return sequelize.define(
    "carbon",
    {
      transaction_id: {
        type: DataTypes.STRING(30),
        allowNull: false,
        primaryKey: true
      },
      group_id: {
        type: DataTypes.STRING(12),
        allowNull: false
      },
      user_id: {
        type: DataTypes.STRING(25),
        allowNull: false
      },
      member_id: {
        type: DataTypes.STRING(11),
        allowNull: false
      },
      trans_object: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      method: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "recycled"
      },
      trans_date: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      tableName: "carbon"
    }
  );
};

Carbon.getByMemberId = function(member_id, callback) {
  Carbon.findAll({ where: { member_id: member_id } })
    .then(function(carbon) {
      callback(null, carbon);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Carbon.getAll = function(callback) {
  Carbon.findAll({})
    .then(function(carbon) {
      callback(null, carbon);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Carbon.getAllThisYear = function(callback) {
  Carbon.findAll({
    where: sequelize.where(
      sequelize.fn("YEAR", sequelize.col("trans_date")),
      moment().format("YYYY")
    )
  })
    .then(function(carbon) {
      callback(null, carbon);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Carbon.getToday = function(callback) {
  Carbon.findAll({
    where: sequelize.where(
      sequelize.fn("DATE", sequelize.col("trans_date")),
      new Date()
    )
  })
    .then(function(carbon) {
      callback(null, carbon);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

Carbon.add = function(transaction, callback) {
  if (transaction.amount > 0) {
    Helpers.uniqueIntId(20, "carbon", "transaction_id", function(id) {
      Carbon.create({
        transaction_id: transaction.id,
        member_id: transaction.member_id,
        user_id: transaction.user_id,
        group_id: transaction.group_id,
        trans_object: ransaction.trans_object,
        method: transaction.method,
        trans_date: new Date()
      })
        .then(function() {
          callback(null);
        })
        .catch(function(err) {
          callback(err);
        });
    });
  } else {
    callback("Error");
  }
};

Carbon.getAllByWorkingGroup = function(group_id, callback) {
  Carbon.getToday = function(callback) {
    Carbon.findAll({
      where: { group_id: group_id }
    })
      .then(function(carbon) {
        callback(null, carbon);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };
};

module.exports = Carbon;
