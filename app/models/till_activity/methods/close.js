module.exports = (TillActivity) => {
  return async (till_id, expected_float, counted_float, user_id, note) => {
    const id = await TillActivity.generateId();
    return TillActivity.create({
      action_id: id,
      till_id: till_id,
      user_id: user_id,
      timestamp: new Date(),
      expected_float: expected_float,
      counted_float: counted_float,
      opening: 0,
      note: note || null,
    });
  };
};
