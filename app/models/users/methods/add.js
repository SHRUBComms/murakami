const bcrypt = require("bcrypt-nodejs");
const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = (Users, sequelize, DataTypes) => {
	return async (user) => {
    		const id = await Users.generateId();
      		user.id = id;
      		user.password = Helpers.generateBase64Id("255");
      		const salt = await bcrypt.genSaltSync(10);
        	const hash = await bcrypt.hashSync(user.password, salt, null);
          	user.password = hash.replace(/^\$2y(.+)$/i, "$2a$1");

		await Users.create({
            		id: user.id,
            		first_name: user.first_name,
            		last_name: user.last_name,
            		username: user.username,
            		email: user.email,
            		password: user.password,
            		class: user.class,
            		working_groups: user.working_groups,
            		notification_preferences: user.notification_preferences,
            		created_at: new Date(),
            		deactivated: 1
          	});

		return user.id;
	}
}
