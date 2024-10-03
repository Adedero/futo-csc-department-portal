require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const path = require("node:path");
const fs = require("node:fs");

const User = require("../models/actors/user.model");
const Student = require("../models/actors/student.model");
const Staff = require("../models/actors/staff.model");
const Dean = require("../models/actors/dean.model");

const StudentClass = require("../models/objects/student-class.model");
const Session = require("../models/objects/session.model");
const Semester = require("../models/objects/semester.model");
const Course = require("../models/objects/course.model");
const CourseRegStatus = require("../models/objects/course-reg-status.model");
const Result = require("../models/objects/result.model");
const ApprovedResult = require("../models/objects/approved-result.model");
const RegisteredCourse = require("../models/objects/registered-course.model");
const Level = require("../models/objects/level.model");

const { validateInput } = require("../utils/validate");
const response = require("../utils/response");
const excelToJson = require("convert-excel-to-json");
const XLSX = require("xlsx");
const normalizeName = require("../utils/normalize-name");

const {
  addStaffCourses,
  removeStaffCourses,
  getCourses,
} = require("../controllers/controller");

const HodController = {
  //Dashboard details
  getDashboardInfo: async (req, res) => {
    let dashboard = {};

    const [staffs, currentSession, currentSemester, pendingResults, advisors] =
      await Promise.all([
        Staff.countDocuments({ isActive: true }),
        Session.findOne({ isCurrent: true }).lean(),
        Semester.findOne({ isCurrent: true }).lean(),
        Result.countDocuments({ isHODApproved: false }),
        Staff.find({ isAdvisor: true })
          .populate({
            path: "user",
            select: "name image",
          })
          .populate("studentClass", "className")
          .lean(),
      ]);

    dashboard = {
      staffs,
      currentSession,
      currentSemester,
      pendingResults,
      advisors,
    };
    return res.status(200).json(dashboard);
  },

  //Get staff
  getAllStaffs: async (req, res) => {
    const staffs = await Staff.find(
      { isHOD: false },
      {
        user: 1,
        isAdvisor: 1,
        studentClass: 1,
        staffId: 1,
        qualification: 1,
        specialization: 1,
        rank: 1,
      },
    )
      .populate("user", "name image")
      .lean();

    return res.status(200).json(staffs);
  },

  //Get staff profile
  getStaffProfile: async (req, res) => {
    const { id } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid)
      return response.send400(res, "The staff ID supplied is invalid.");

    const staff = await Staff.findById(id)
      .populate(
        "user",
        "name title username email phoneNumber sex address image",
      )
      .populate("studentClass", "className currentLevel")
      .populate("courses", "code title")
      .lean();

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "No staff with the given ID was found",
      });
    }
    return res.status(200).json(staff);
  },

  //Add staff
  addStaff: async (req, res) => {
    const payload = req.body;

    const query = [{ username: payload.username }];
    if (payload.email) query.push({ email: payload.email });
    if (payload.phoneNumber) query.push({ phoneNumber: payload.phoneNumber });

    const [existingUser, existingStaff] = await Promise.all([
      User.find({ $or: query }, { _id: 1 }).lean(),
      Staff.find({ staffId: payload.staffId }, { _id: 1 }).lean(),
    ]);

    if (existingUser.length || existingStaff.length) {
      return response.send400(
        res,
        "A staff with this username, staffId, email or phone number already exists",
      );
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const newUser = await User.create({
      name: payload.name,
      title: payload.title,
      username: payload.username,
      role: payload.role,
      password: hashedPassword,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      sex: payload.sex,
      address: payload.address,
      isActive: payload.isActive || true,
    });

    const newStaff = await Staff.create({
      user: newUser._id,
      staffId: payload.staffId,
      rank: payload.rank,
      isHOD: false,
      isAdvisor: false,
      specialization: payload.specialization,
      qualification: payload.qualification,
      dateOfBirth: payload.dateOfBirth,
      nationality: payload.nationality,
      stateOfOrigin: payload.stateOfOrigin,
    });

    return res.status(200).json({
      _id: newStaff._id,
      user: { name: newUser.name },
      staffId: newStaff.staffId,
      rank: newStaff.rank,
      qualification: newStaff.qualfication,
      specialization: newStaff.specialization,
    });
  },

  //Course allocation
  //Gets course allocation details
  getCourseAllocation: async (req, res) => {
    const [currentSession, currentSemester, staffs, courses] =
      await Promise.all([
        Session.findOne({ isCurrent: true }).lean(),
        Semester.findOne({ isCurrent: true }).lean(),
        Staff.find({ isHOD: false, isActive: true }, { courses: 1 })
          .populate("user", "name")
          .populate("courses", "code title level")
          .lean(),
        Course.find({}, { code: 1, title: 1, level: 1 }).lean(),
      ]);

    return res.status(200).json({
      currentSession,
      currentSemester,
      staffs,
      courses,
    });
  },

  //Allocate course
  allocateCourse: async (req, res) => {
    const course = req.body;
    if (!course) {
      return response.send400(res, "No course was provided.");
    }

    const staffIds = course.staffs.map((staff) => staff.id);

    const courseId = course._id;

    const promises = [Staff.updateMany({}, { $pull: { courses: courseId } })];

    if (course.staffs.length) {
      promises.push(
        Staff.updateMany(
          { _id: { $in: staffIds } },
          { $addToSet: { courses: { $each: [courseId] } } },
        ),
      );
    }

    await Promise.all(promises);

    return res.status(200).json({
      message: "Course allocated successfully.",
    });
  },

  //CLASSES APIs
  getClasses: async (req, res) => {
    const studentClasses = await StudentClass.find()
      .populate({
        path: "advisor",
        select: "user isAdvisor",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .lean();
    return res.status(200).json(studentClasses);
  },

  //Create or edit class
  manageClass: async (req, res) => {
    const payload = req.body;
    const {
      advisor,
      newAdvisor,
      _id,
    } = payload;

    let updates = [];

    if (!advisor && !newAdvisor) {
      return res.status(200).json({ message: 'No changes were made.' });
    }

    if (advisor && !newAdvisor) {
      updates.push(
        // Change the old advisor's role to 'STAFF'
        User.updateOne(
          { _id: advisor.user._id },
          { $set: { role: "STAFF" } },
        ),
        // Remove the class ID from the old advisor's info
        Staff.updateOne(
          { _id: advisor._id },
          { $set: { studentClass: null, isAdvisor: false } },
        ),

        //Remove the advisor ID from the student class
        StudentClass.updateOne(
          { _id: _id },
          { $set: { advisor: null } }
        )
      )

      await Promise.all(updates);
      return res.status(200).json({ messages: 'Advisor removed.' });
    }

    if (!advisor && newAdvisor) {
      updates.push(
        // Remove the new advisor from the old class
        StudentClass.updateOne(
          { advisor: newAdvisor._id },
          { $set: { advisor: null } },
        ),
        // Add the new advisor's ID to the edited class
        StudentClass.updateOne(
          { _id: _id },
          { $set: { advisor: newAdvisor._id } },
          { new: true },
        ),
        // Change new advisor's role to 'ADVISOR'
        User.updateOne(
          { _id: newAdvisor.user._id },
          { $set: { role: "ADVISOR" } },
        ),
        // Add the class ID to the new advisor's info
        Staff.updateOne(
          { _id: newAdvisor._id },
          { $set: { studentClass: _id, isAdvisor: true } },
        ),
      );

      await Promise.all(updates);
      return res.status(200).json({ messages: 'Advisor added to class.' });
    }

    if (advisor && newAdvisor) {
      if (advisor._id.toString() === newAdvisor._id.toString()) {
        return res.status(200).json({ message: 'No changes were made.' });
      }
      updates.push(
        // Remove the new advisor from the old class
        StudentClass.updateOne(
          { advisor: newAdvisor._id },
          { $set: { advisor: null } },
        ),
        // Change new advisor's role to 'ADVISOR'
        User.updateOne(
          { _id: newAdvisor.user._id },
          { $set: { role: "ADVISOR" } },
        ),
        // Add the class ID to the new advisor's info
        Staff.updateOne(
          { _id: newAdvisor._id },
          { $set: { studentClass: _id, isAdvisor: true } },
        ),
        // Add the new advisor's ID to the edited class
        StudentClass.updateOne(
          { _id: _id },
          { $set: { advisor: newAdvisor._id } },
        ),
        // Change the old advisor's role to 'STAFF'
        User.updateOne(
          { _id: advisor.user._id },
          { $set: { role: "STAFF" } },
        ),
        // Remove the class ID from the old advisor's info
        Staff.updateOne(
          { _id: advisor._id },
          { $set: { studentClass: null, isAdvisor: false } },
        ),
      );
      await Promise.all(updates);
      return res.status(200).json({ messages: 'Advisor changes.' });
    }

    return res.status(200).json({ messages: 'Changes applied.' });
  },

  //Gets pending results created within the last 6 months
  getPendingResults: async (req, res) => {
    const results = await Result.find(
      { isDeanApproved: false },
      { students: 0 },
    )
      .populate({
        path: "staff",
        select: "user",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .lean();

    const briefResults = results.map((result) => {
      return {
        _id: result._id,
        course: result.course.code,
        semester: result.semester,
        session: result.session,
        level: result.level,
        staff: result.staff.user.name,
        isHODApproved: result.isHODApproved,
        isDeanApproved: result.isDeanApproved,
        updatedAt: result.updatedAt,
        HODDisapproved: result.HODDisapproved,
        deanDisapproved: result.deanDisapproved,
      };
    });
    return res.status(200).json(briefResults);
  },

  //Gets result to display the OGR
  getOgrResult: async (req, res) => {
    const { resultId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return response.send400(
        res,
        "Failed to retrieve result because an invalid result ID was passed.",
      );
    }

    const [staff, result] = await Promise.all([
      Staff.findOne({ user: req.user._id }, { _id: 1 }).lean(),
      Result.findById(resultId).lean(),
    ]);

    if (!result) {
      return response.send400(res, "The requested result was not found.");
    }

    return res.status(200).json({ result, staff });
  },

  //Approves a result
  approveResult: async (req, res) => {
    const resultId = req.params.id;

    if (!resultId || !mongoose.Types.ObjectId.isValid(resultId)) {
      return response.send400(res, "Invalid result ID provided");
    }

    const edits = {
      isHODApproved: true,
      HODDisapproved: {
        isDisapproved: false,
        reason: "",
      },
    };

    await Result.updateOne({ _id: resultId }, { $set: edits });

    return res.status(200).json({ success: true, message: "Result approved" });
  },

  //Disapprove a result
  disapproveResult: async (req, res) => {
    const resultId = req.params.id;
    const { reason } = req.body;

    if (!resultId || !mongoose.Types.ObjectId.isValid(resultId)) {
      return response.send400(res, "Invalid result ID provided");
    }

    const edits = {
      isHODApproved: false,
      HODDisapproved: {
        isDisapproved: true,
        reason: reason,
      },
    };

    await Result.updateOne({ _id: resultId }, { $set: edits });

    return res
      .status(200)
      .json({ success: true, message: "Result disapproved" });
  },
};

module.exports = HodController;
