const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = (Members, sequelize, DataType) => {
	return async (member, user) => {
    		let sanitizedMember = {};

    		if (!user.permissions) {
      			user.permissions = {};
    		} else {
      			if (!user.permissions.members) {
        			user.permissions.members = {};
      			}

      			if (!user.permissions.volunteers) {
        			user.permissions.volunteers = {};
      			}
    		}

    		if (member) {
      			member.full_name = member.first_name + " " + member.last_name;

      			if (!member.working_groups) {
        			member.working_groups = [];
      			}

      			if (!member.address) {
        			sanitizedMember.requiresAddress = true;
      			}

      			if (!member.roles) {
        			member.roles = [];
      			}

      			if (!member.contactPreferences) {
        			member.contactPreferences = { donations: true };
      			}

      			if (!member.gdpr) {
        			member.gdpr = {};
      			}

      			if (!member.assignedCoordinators) {
        			member.assignedCoordinators = [];
      			}

      			try {
        			if (member.current_exp_membership == "01/01/9999" || ["lifetime", "staff", "trustee"].includes(member.membership_type)) {
          				member.current_exp_membership = "never";
        			}
      			} catch (error) {}

			for await (const role of member.roles) {
          			if (user.allVolunteerRoles) {
            				try {
              					if (user.allVolunteerRoles[role]) {
                					member.working_groups.push(user.allVolunteerRoles[role].group_id);
              					}

						try {
                					if (user.allWorkingGroupsObj[user.allVolunteerRoles[role].group_id].parent) {
                  						member.working_groups.push(user.allWorkingGroupsObj[user.allVolunteerRoles[role].group_id].parent);
                					}
              					} catch (error) {}
            				} catch (error) {
              					member.working_groups = [user.allVolunteerRoles[role].group_id];
            				}
          			}
			}


			member.working_groups = Array.from(new Set(member.working_groups));

          		const commonWorkingGroup = Helpers.hasOneInCommon(member.working_groups, user.working_groups);
          		const isCoordinator = member.assignedCoordinators.includes(user.id);

          		try {
            			if (user.permissions.members.name == true || (user.permissions.members.name == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.name == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.first_name = member.first_name;
              				sanitizedMember.last_name = member.last_name;
              				sanitizedMember.name = member.first_name + " " + member.last_name;
            			}
          		} catch (error) {}

          		try {
            			if (user.permissions.members.membershipDates == true || (user.permissions.members.membershipDates == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.membershipDates == "isCoordinator" && isCoordinator) ) {
              				sanitizedMember.exp_date = member.current_exp_membership;
              				sanitizedMember.current_exp_membership = member.current_exp_membership;
              				sanitizedMember.current_init_membership = member.current_init_membership;
              				sanitizedMember.earliest_membership_date = member.earliest_membership_date;
            			}
          		} catch (error) {}

          		try {
            			if (user.permissions.members.contactDetails == true || (user.permissions.members.contactDetails == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.contactDetails == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.email = member.email;
              				sanitizedMember.phone_no = member.phone_no;
              				sanitizedMember.address = member.address;
            			}
          		} catch (error) {}

          		try {
            			if (user.permissions.members.manageMembershipCard == true || (user.permissions.members.manageMembershipCard == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.manageMembershipCard == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.barcode = member.barcode;
            			}
          		} catch (error) {}

          		try {
            			if (user.permissions.members.balance == true || (user.permissions.members.balance == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.balance == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.balance = member.balance;
            			}
          		} catch (error) {}

          		try {
            			if (user.permissions.members.workingGroups == true || (user.permissions.members.workingGroups == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.workingGroups == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.working_groups = member.working_groups;
            			}
          		} catch (error) {}

          		try {
            			if (user.permissions.members.carbonSaved == true || (user.permissions.members.carbonSaved == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.carboNSaved == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.canViewSavedCarbon = true;
            			}
          		} catch (error) {}

          		try {
            			if (user.permissions.members.transactionHistory == true || (user.permissions.members.transactionHistory == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.transactionHistory == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.transactionHistory = true;
            			}
          		} catch (error) {}

          		try {
            			if (user.permissions.volunteers.view == true || (user.permissions.volunteers.view == "commonWorkingGroup" && commonWorkingGroup && member.volunteer_id) || (user.permissions.volunteers.view == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.volunteer_id = member.volunteer_id;
            			}
          		} catch (error) {}

          		try {
            			if (user.permissions.members.update == true || (user.permissions.members.update == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.update == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.canUpdate = true;
           			}
          		} catch (error) {}

          		try {
            			if (user.permissions.members.canRevokeMembership == true || (user.permissions.members.canRevokeMembership == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.canRevokeMembership == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.canRevokeMembership = true;
            			}
          		} catch (error) {}

			try {
				if (user.permissions.members.delete == true || (user.permissions.members.delete == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.delete == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.canDelete = true;
            			}
          		} catch (error) {}

			try {
				if (user.permissions.members.manageMembershipCard == true || (user.permissions.members.manageMembershipCard == "commonWorkingGroup" && commonWorkingGroup) || (user.permissions.members.manageMembershipCard == "isCoordinator" && isCoordinator)) {
              				sanitizedMember.canManageMembershipCard = true;
            			}
          		} catch (error) {}

			if (Object.keys(sanitizedMember).length > 0) {
            			if (member.activeVolunteer) {
              				sanitizedMember.activeVolunteer = true;
            			}

            			if (member.membership_type) {
              				sanitizedMember.membership_type = member.membership_type;
            			}

            			sanitizedMember.member_id = member.member_id;
            			sanitizedMember.is_member = member.is_member;

				if (["lifetime", "staff", "trustee"].includes(member.membership_type)) {
              				sanitizedMember.is_member = true;
            			}

				sanitizedMember.free = member.free;
            			sanitizedMember.gdpr = member.gdpr;
            			sanitizedMember.contactPreferences = member.contactPreferences;
            			sanitizedMember.fullname = member.full_name;
            			sanitizedMember.membership_id = member.member_id;
            			sanitizedMember.contact_preferences_link = process.env.PUBLIC_ADDRESS + "/contact-preferences/" + member.member_id;
          		} else {
            			sanitizedMember = null;
          		}
		} else {
			sanitizedMember = null;
		}

		return sanitizedMember;
	}
}
