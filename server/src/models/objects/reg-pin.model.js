const mongoose = require("mongoose");

const PINSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ["ADMIN", "ADVISOR", "STAFF", "STUDENT", "HOD", "DEAN"],
  },
  value: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 * 24,
  },
});

module.exports = mongoose.model("PIN", PINSchema);
