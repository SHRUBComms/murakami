module.exports = (VolunteerHours, sequelize, DataTypes) => {
	return async (group_id, startDate, endDate, members) => {
		try {
			const shifts = await VolunteerHours.findAll({
				where: {
					working_group: group_id,
					date: { [DataTypes.Op.between]: [startDate, endDate] }
				}
			});

			let formattedShifts = [];
			for await (let shift of shifts) {
				if (members[shift.member_id]) {
					shift.member = members[shift.member_id].first_name + " " + members[shift.member_id].last_name;
				} else {
					shift.member = "Unknown";
				}

				if(shift.note == "undefined") {
					shift.note = null;
				}

				formattedShifts.push(shift);
			}

			return formattedShifts;

		} catch (error) {
			throw error;
		}
	}
}
