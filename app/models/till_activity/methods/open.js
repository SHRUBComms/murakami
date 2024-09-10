module.exports = (TillActivity) => {
  return async (till_id, counted_float, user_id, note) => {
    const id = await TillActivity.generateId();

    return TillActivity.create({
      action_id: id,
      till_id: till_id,
      user_id: user_id,
      timestamp: new Date(),
      expected_float: null,
      counted_float: counted_float,
      opening: 1,
      note: note || null,
    });
  };
};
