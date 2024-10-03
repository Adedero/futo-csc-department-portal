const mongoose = require("mongoose");

const CourseRegStatusSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "courseRegistrationStatus",
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
  openSessions: {
    type: [String],
    required: true,
  },
  openSemesters: {
    type: [String],
    required: true,
  },
  openLevels: {
    type: [Number],
    required: true,
  },
});

module.exports = mongoose.model("CourseRegStatus", CourseRegStatusSchema);
