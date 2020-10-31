module.exports = (Members, sequelize) => {
  return async (info) => {
    try {
      const query = "SELECT * FROM members WHERE (CONCAT(first_name, ' ', last_name) LIKE ?) AND email = ?";
      const inserts = ["%" + info.name + "%", info.email];

      const results = await sequelize.query(query, { replacements: inserts });

      if(!results[0]) {
        throw "No results";
      }

      return results[0];
    } catch (error) {
      return [];
    }
  }
}
