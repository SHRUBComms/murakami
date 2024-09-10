module.exports = function (Volunteers, sequelize, DataTypes) {
  return function (volInfo, callback) {
    const query = `INSERT INTO volunteer_info (member_id, emergencyContactRelation, emergencyContactName, emergencyContactPhoneNo, roles, hoursPerWeek, survey, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE emergencyContactRelation = ?, emergencyContactName = ?, emergencyContactPhoneNo = ?, roles = ?, hoursPerWeek = ?, survey = ?, availability = ?`;
    const inserts = [
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
      volInfo.availability,
    ];

    sequelize.query(query, { replacements: inserts }).nodeify(callback);
  };
};
