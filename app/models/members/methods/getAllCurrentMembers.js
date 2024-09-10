module.exports = (Members) => {
  return async () => {
    return Members.findAll({ where: { is_member: 1 } });
  };
};
