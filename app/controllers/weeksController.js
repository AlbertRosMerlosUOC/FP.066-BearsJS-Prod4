const Week = require("../models/Week");
const pubsub = require("../pubsub");

const getWeeks = async () => {
  return await Week.find();
};

const getWeekById = (root, args) => {
  return Week.findById(args._id).exec();
};

const createWeek = async (
  _,
  { week, year, description, type, hour_ini, hour_end, color }
) => {
  const newWeek = new Week({
    week,
    year,
    description,
    type,
    hour_ini,
    hour_end,
    color,
  });
  pubsub.publish("NEW_WEEK", { newWeek });
  return await newWeek.save();
};

const updateWeek = async (
  _,
  { _id, week, year, description, type, hour_ini, hour_end, color }
) => {
  const updatedWeek = await Week.findByIdAndUpdate(
    _id,
    { week, year, description, type, hour_ini, hour_end, color },
    { new: true }
  );
  pubsub.publish("UPDATED_WEEK", { updatedWeek });
  return updatedWeek;
};

const deleteWeek = async (_, { _id }) => {
  const deletedWeek = await Week.findByIdAndDelete(_id);
  pubsub.publish("DELETED_WEEK", { deletedWeek });
  return deletedWeek;
};

module.exports = {
  getWeeks,
  getWeekById,
  createWeek,
  updateWeek,
  deleteWeek,
};
