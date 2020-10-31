module.exports = (Volunteers) => {
  return async (member_id, volunteer) => {
    return Volunteers.create({
      member_id: member_id,
      emergencyContactRelation: volunteer.emergencyContactRelation,
      emergencyContactName: volunteer.emergencyContactName,
      emergencyContactPhoneNo: volunteer.emergencyContactPhoneNo,
      roles: volunteer.roles,
      assignedCoordinators: volunteer.assignedCoordinators,
      survey: {
        goals: volunteer.survey.goals || "",
        interests: volunteer.survey.interests || "",
        additionalNotes: volunteer.survey.additionalNotes || "",
        skills: volunteer.survey.skills || [],
        contactMethods: volunteer.survey.contactMethods || []
      },
      availability: volunteer.availability,
      gdpr: {
        email: volunteer.gdpr.email ? true : false,
        phone: volunteer.gdpr.phone ? true : false
      }
    });
  }
}
