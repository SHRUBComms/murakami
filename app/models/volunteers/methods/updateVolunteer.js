module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(member_id, volInfo, callback) {
    var query =
      "UPDATE volunteer_info SET emergencyContactRelation = ?, emergencyContactName = ?, emergencyContactPhoneNo = ?, roles = ?, assignedCoordinators = ?, survey = ?, availability = ?, gdpr = ? WHERE member_id = ?";
    var inserts = [
      volInfo.emergencyContactRelation,
      volInfo.emergencyContactName,
      volInfo.emergencyContactPhoneNo,
      JSON.stringify(volInfo.roles),
      JSON.stringify(volInfo.assignedCoordinators),
      JSON.stringify(volInfo.survey),
      JSON.stringify(volInfo.availability),
      JSON.stringify({
        email: volInfo.gdpr.email,
        phone: volInfo.gdpr.phone
      }),
      member_id
    ];
    var sql = mysql.format(query, inserts);
    con.query(sql, callback);
  };
};
