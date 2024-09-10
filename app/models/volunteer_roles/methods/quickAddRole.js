module.exports = (VolunteerRoles) => {
  return async (working_group, title) => {
    const roleId = await VolunteerRoles.generateId();
    await VolunteerRoles.create({
      role_id: roleId,
      group_id: working_group,
      details: { title: title },
      availability: {},
      dateCreated: new Date(),
      public: 0,
    });
    return { role_id: roleId, group_id: working_group, details: { title: title } };
  };
};
