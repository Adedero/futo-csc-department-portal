const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },
  studentClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentClass",
    required: true,
  },
  regNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  entryMode: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  nationality: {
    type: String,
  },
  stateOfOrigin: {
    type: String,
  },
  isAllowed27units: [
    {
      session: {
        type: String,
      },
      semester: {
        type: String,
      },
      isAllowed: {
        type: Boolean,
      },
    },
  ],
});

module.exports = mongoose.model("Student", StudentSchema);
