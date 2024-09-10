module.exports = (WorkingGroups, sequelize, DataTypes) => {
  return async () => {
    const working_groups = await WorkingGroups.findAll({ raw: true });

    const working_groups_obj = {};
    const working_groups_arr = [];

    for await (const group of working_groups) {
      working_groups_arr.push(group.group_id);
      working_groups_obj[group.group_id] = group;

      if (group.parent) {
        try {
          working_groups_obj[group.parent].children.push(group.group_id);
        } catch (err) {
          working_groups_obj[group.parent].children = [group.group_id];
        }
      }
    }

    return {
      allWorkingGroupsObj: working_groups_obj,
      allWorkingGroupsArray: working_groups,
      allWorkingGroupsFlat: working_groups_arr,
    };
  };
};
