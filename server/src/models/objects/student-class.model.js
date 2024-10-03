const mongoose = require("mongoose");

const StudentClassSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  enrolmentYear: {
    type: Number,
    required: true,
  },
  currentLevel: {
    type: Number,
    required: true,
    index: true,
  },
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  isActive: {
    type: Boolean,
    required: true,
  },
});

StudentClassSchema.set("timestamps", true);

StudentClassSchema.pre("save", async function (next) {
  if (this.currentLevel === 0 || this.currentLevel > 500) {
    this.isActive = false;
    if (this.currentLevel > 1000) {
      this.currentLevel = 0;
    }
  } else if (this.currentLevel > 0 && this.currentLevel <= 500) {
    this.isActive = true;
  }
  next();
});

StudentClassSchema.pre("find", async function (next) {
  this.sort({ className: -1 });
  next();
});

module.exports = mongoose.model("StudentClass", StudentClassSchema);
