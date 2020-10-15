const bcrypt = require("bcrypt-nodejs");

module.exports = (Users, sequelize, DataTypes) => {
	return async (candidatePassword, hash) => {
		try {
			const legacyHash = hash.replace(/^\$2y(.+)$/i, "$2a$1"); // Convert hash format (hangover from original user database)
			const isMatch = await bcrypt.compareSync(candidatePassword, legacyHash);
			return isMatch;
		} catch(error) {
			return false;
		}
	}
}
