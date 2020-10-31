module.exports = (Members, sequelize) => {
  return async () => {
    const query = `SELECT * FROM members
      LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles, assignedCoordinators
      FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
      ORDER BY first_name ASC LIMIT 100000`;
    const membersArray = await sequelize.query(query);
    const membersObj = membersArray[0].reduce((obj, item) => Object.assign(obj, { [item.member_id]: item }), {});
    return { membersArray: membersArray[0], membersObj };
	}
}
