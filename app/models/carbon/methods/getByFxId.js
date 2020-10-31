module.exports = (Carbon) => {
  return async (fx_transaction_id) => {
    return Carbon.findAll({ where: { fx_transaction_id: fx_transaction_id } });
  };
};
