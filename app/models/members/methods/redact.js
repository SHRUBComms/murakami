module.exports = (Members) => {
  return async (member_id) => {
    return Members.update({
      first_name: "[redacted]",
      last_name: "[redacted]",
      email: "[redacted]",
      phone_no: "[redacted]",
      address: "[redacted]",
      working_groups: [],
      is_member: 0
    },
    { where : { member_id: member_id }
    })
  };
};

