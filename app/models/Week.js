const mongoose = require("mongoose");

const weekSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  year: { type: Number, required: true },
  description: String,
  type: { type: String, required: true },
  hour_ini: String,
  hour_end: String,
  color: String,
});

const Week = mongoose.model("Week", weekSchema);

module.exports = Week;
