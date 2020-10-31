module.exports = (Members) => {
  return async (member_id, new_balance) => {
    return Members.update({ balance: new_balance }, { where: { member_id: member_id } });
  };
};
