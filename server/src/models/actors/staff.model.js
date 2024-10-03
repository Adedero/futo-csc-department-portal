const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },
  courses: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Course",
    default: [],
  },
  staffId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  studentClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentClass",
  },
  isHOD: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAdvisor: {
    type: Boolean,
    required: true,
    default: false,
  },
  specialization: {
    type: Array,
    default: [],
  },
  qualification: {
    type: Array,
    default: [],
  },
  rank: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  nationality: {
    type: String,
  },
  stateOfOrigin: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

StaffSchema.pre("save", async function (next) {
  if (this.isHOD) {
    // If the current staff member is being set as HOD, update all other staff members to not be HOD
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isHOD: false } },
    );
  }
  next();
});

module.exports = mongoose.model("Staff", StaffSchema);
