module.exports = async (records, sumupTransactions, batchSize = 1000) => {
  try {
    await sumupTransactions.sync();
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await sumupTransactions.bulkCreate(batch, {
        validate: true,
        returning: true,
      });
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
    }
    console.log("All records inserted successfully");
  } catch (error) {
    console.error("Error inserting records:", error);
  }
};
