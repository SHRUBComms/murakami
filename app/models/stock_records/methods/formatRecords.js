const lodash = require("lodash");
const moment = require("moment");
moment.locale("en-gb");

module.exports = () => {
  return async (records, usersObj, categories, workingGroups) => {
    let formattedRecords = [];
    for await (const record of records) {
      let formattedRecord = {
        action_id: record.action_id,
        item_id: record.item_id,
        condition: lodash.startCase(record.itemCondition),
        actionInfo: record.actionInfo
      };

      if(categories) {
        formattedRecord.itemName = `${categories[formattedRecord.item_id].absolute_name} (${formattedRecord.condition})`;
        if (workingGroups) {
          if (categories[formattedRecord.item_id].group_id) {
            if (workingGroups[categories[formattedRecord.item_id].group_id]) {
              formattedRecord.groupName = workingGroups[categories[formattedRecord.item_id].group_id].name;
            } else {
              formattedRecord.groupName = "-";
            }
          }
        }
      }

      formattedRecord.actionInfo.niceMethod = lodash.startCase(formattedRecord.actionInfo.method);

      formattedRecord.timestamp = moment(record.timestamp);
      formattedRecord.timestamp = moment(formattedRecord.timestamp).format("D/M/YY hh:mm A");

      if (usersObj[record.user_id]) {
        formattedRecord.user = `${usersObj[record.user_id].first_name} ${usersObj[record.user_id].last_name}`;
      } else {
        formattedRecord.user = "Unknown User";
      }

      formattedRecords.push(formattedRecord);
    }

    return formattedRecords;
  }
}
