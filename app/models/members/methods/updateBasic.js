module.exports = (Members) => {
  return async (member) => {
    return Members.update(
      {
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone_no: member.phone_no,
        address: member.address,
        balance: member.balance,
        is_member: member.is_member,
        membership_type: member.membership_type,
        free: member.free,
        current_exp_membership: member.current_exp_membership,
      },
      { where: { member_id: member.member_id } }
    );
  };
};
