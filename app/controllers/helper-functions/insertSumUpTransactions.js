module.exports = async (records, sumupTransactions, batchSize = 1000) => {
  try {
    await sumupTransactions.sync();
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await sumupTransactions.bulkCreate(batch, {
        validate: true,
        returning: true,
      });
      console.log(`Inserted batch of ${batch.length} records`);
    }
    console.log(`${records.length} records inserted successfully`);
  } catch (error) {
    console.error("Error inserting records:", error);
  }
};
