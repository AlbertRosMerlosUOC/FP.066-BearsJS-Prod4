/* TODO

const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  _id_task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  name: { type: String, required: true },
  file: {
    data: Buffer,
    contentType: String
  }
});

const File = mongoose.model("File", fileSchema);

module.exports = File;*/
