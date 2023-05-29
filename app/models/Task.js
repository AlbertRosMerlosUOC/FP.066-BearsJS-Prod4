const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  _id_week: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Week",
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  hour_ini: String,
  hour_end: String,
  type: { type: String, required: true },
  user: String,
  in_day: String,
  finished: { type: Boolean, required: true }
  /*, TODO
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    required: false,
  }*/
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
