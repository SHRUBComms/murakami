module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(member_id, volInfo, callback) {
    Volunteers.create({
      member_id: member_id,
      emergencyContactRelation: volInfo.emergencyContactRelation,
      emergencyContactName: volInfo.emergencyContactName,
      emergencyContactPhoneNo: volInfo.emergencyContactPhoneNo,
      roles: volInfo.roles,
      assignedCoordinators: volInfo.assignedCoordinators,
      survey: volInfo.survey,
      availability: volInfo.availability,
      gdpr: {
        email: volInfo.gdpr.email,
        phone: volInfo.gdpr.phone
      }
    }).nodeify(function(err) {
      callback(err);
    });
  };
};
