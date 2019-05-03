module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(member_id, volInfo, callback) {
    var query =
      "INSERT INTO volunteer_info (member_id, emergencyContactRelation, emergencyContactName, emergencyContactPhoneNo, roles, assignedCoordinators, survey, availability, gdpr) VALUES (?,?,?,?,?,?,?,?,?)";
    var inserts = [
      member_id,
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
      })
    ];
    var sql = mysql.format(query, inserts);
    con.query(sql, callback);
  };
};
