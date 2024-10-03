const mongoose = require("mongoose");

const DeanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },
  staffId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  school: {
    acronymn: {
      type: String,
      required: true,
      default: "SICT",
    },
    fullName: {
      type: String,
      required: true,
      default: "School of Information and Communication Technology",
    },
  },
});

module.exports = mongoose.model("Dean", DeanSchema);
