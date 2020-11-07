module.exports = (Members, sequelize, DataTypes) => {
  	return async (member) => {
    		const memberId = await Members.generateId();
      		member.member_id = memberId;

      		await Members.create({
        		member_id: member.member_id,
        		first_name: member.first_name,
        		last_name: member.last_name,
        		email: member.email,
        		phone_no: member.phone_no,
        		address: member.address,
        		is_member: 1,
        		free: member.free,
            balance: 0,
            contactPreferences: member.contactPreferences,
        		membership_type: member.membership_type,
        		earliest_membership_date: member.earliest_membership_date,
        		current_init_membership: member.current_init_membership,
        		current_exp_membership: member.current_exp_membership
    		});

		return memberId;
  	}
}
