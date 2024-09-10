module.exports = async (allOrganisations, dropOffOrganisations) => {
  let allValid = true;

  for await (const organisation_id of dropOffOrganisations) {
    if (!allOrganisations[organisation_id]) {
      allValid = false;
    } else {
      if (allOrganisations[organisation_id].active == 0) {
        allValid = false;
      } else {
        if (!allOrganisations[organisation_id].type.includes("drop-offs")) {
          allValid = false;
        }
      }
    }
  }

  return allValid;
};
