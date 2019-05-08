module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(member_id, volInfo, callback) {
    Volunteers.create({
      member_id: member_id,
      emergencyContactRelation: volInfo.emergencyContactRelation,
      emergencyContactName: volInfo.emergencyContactName,
      emergencyContactPhoneNo: volInfo.emergencyContactPhoneNo,
      roles: JSON.stringify(volInfo.roles),
      assignedCoordinators: JSON.stringify(volInfo.assignedCoordinators),
      survey: JSON.stringify(volInfo.survey),
      availability: JSON.stringify(volInfo.availability),
      gdpr: JSON.stringify({
        email: volInfo.gdpr.email,
        phone: volInfo.gdpr.phone
      })
    }).nodeify(function(err) {
      callback(err);
    });
  };
};
