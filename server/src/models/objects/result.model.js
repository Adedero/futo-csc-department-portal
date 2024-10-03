const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
    index: true,
  },
  course: {
    code: {
      type: String,
    },
    title: {
      type: String,
    },
    unit: {
      type: Number,
    },
    level: {
      type: Number,
    },
    isElective: {
      type: Boolean,
    },
    hasPractical: {
      type: Boolean,
    },
    schoolOfferingCourse: {
      type: String,
    },
  },
  session: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  isHODApproved: {
    type: Boolean,
    required: true,
    default: false,
    index: true,
  },
  isDeanApproved: {
    type: Boolean,
    required: true,
    default: false,
    index: true,
  },
  HODDisapproved: {
    isDisapproved: { type: Boolean, default: false },
    reason: { type: String },
  },
  deanDisapproved: {
    isDisapproved: { type: Boolean, default: false },
    reason: { type: String },
  },
  approvedAt: {
    type: Date,
  },
  isAddedByAdvisor: {
    type: Boolean,
    required: true,
    default: false,
  },
  students: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      studentClassId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentClass",
      },
      regNumber: {
        type: String,
      },
      name: {
        type: String,
      },
      testScore: {
        type: Number,
      },
      labScore: {
        type: Number,
      },
      examScore: {
        type: Number,
      },
      totalScore: {
        type: Number,
      },
      grade: {
        type: String,
      },
      remark: {
        type: String,
      },
      year: {
        type: Number,
      },
    },
  ],
});

ResultSchema.set("timestamps", true);

module.exports = mongoose.model("Result", ResultSchema);
