module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(volInfo, callback) {
    var query = `INSERT INTO volunteer_info (member_id, emergencyContactRelation, emergencyContactName, emergencyContactPhoneNo, roles, hoursPerWeek, survey, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE emergencyContactRelation = ?, emergencyContactName = ?, emergencyContactPhoneNo = ?, roles = ?, hoursPerWeek = ?, survey = ?, availability = ?`;
    var inserts = [
      volInfo.member_id,
      volInfo.emergencyContactRelation,
      volInfo.emergencyContactName,
      volInfo.emergencyContactPhoneNo,
      volInfo.roles,
      volInfo.hoursPerWeek,
      volInfo.survey,
      volInfo.availability,
      volInfo.emergencyContactRelation,
      volInfo.emergencyContactName,
      volInfo.emergencyContactPhoneNo,
      volInfo.roles,
      volInfo.hoursPerWeek,
      volInfo.survey,
      volInfo.availability
    ];

    var sql = mysql.format(query, inserts);

    sequelize.query(sql, callback);
  };
};
