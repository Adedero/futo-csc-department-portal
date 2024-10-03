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

const StaffController = {
  getDashboardInfo: async (req, res) => {
    const userId = req.user._id;
    let dashboard = {};

    const [staff, currentSession, currentSemester] = await Promise.all([
      Staff.findOne({ user: userId }, { _id: 1, staffId: 1, courses: 1 })
        .populate("courses")
        .lean(),
      Session.findOne({ isCurrent: true }).lean(),
      Semester.findOne({ isCurrent: true }).lean(),
    ]);

    const results = await Result.countDocuments({ staff: staff._id });

    dashboard = {
      staff,
      currentSession,
      currentSemester,
      results,
    };
    return res.status(200).json(dashboard);
  },

  getUploadedResults: async (req, res) => {
    const userId = req.user._id;
    const staff = await Staff.findOne({ user: userId }, { courses: 1 })
      .populate("courses", "code level semester")
      .lean();

    const [results, sessions] = await Promise.all([
      Result.find({ staff: staff._id }, { students: 0 }).lean(),
      Session.find().lean(),
    ]);

    const payload = {
      staff,
      results,
      sessions,
    };

    return res.status(200).json(payload);
  },

  //Get registered students to upload results
  getRegisteredStudents: async (req, res) => {
    const { staffId, session, semester, level, course } = req.query;
    if (!staffId || !session || !semester || !level || !course) {
      return response.send400(res, "All fields are required.");
    }

    const [selectedCourse, existingResult, registeredCourses] =
      await Promise.all([
        Course.findOne({ code: course }).lean(),

        Result.findOne({
          //staff: staffId,
          session: session,
          semester: semester,
          level: level,
          "course.code": course,
        }).lean(),

        RegisteredCourse.find({
          session: session,
          semester: semester,
          level: level,
        })
          .populate({
            path: "student",
            select: "user regNumber studentClass",
            populate: {
              path: "user",
              select: "name",
            },
          })
          .lean(),
      ]);

    if (!selectedCourse) {
      return response.send400(res, "Course not found.");
    }

    const filteredCourses = registeredCourses.filter((record) =>
      record.courses.some((c) => c.code === course),
    );

    
    if (existingResult) {
      return res
        .status(200)
        .json({ existing: true, resultId: existingResult._id });
    }
    const students = filteredCourses.map((record) => {
      return {
        _id: record.student._id,
        name: record.student.user.name,
        regNumber: record.student.regNumber,
        year: record.year,
        studentClassId: record.student.studentClass,
      };
    });

    return res.status(200).json({
      existing: false,
      course: selectedCourse,
      records: students,
      staffId,
      session,
      semester,
      level,
    });
  },

  //Add result
  addResult: async (req, res) => {
    const payload = req.body;

    if (!payload) {
      return response.send400(
        res,
        "Invalid request. No  results was received.",
      );
    }

    const existingResult = await Result.findOne({
      staff: payload.staffId,
      session: payload.session,
      semester: payload.semester,
      level: payload.level,
      "course.code": payload.course.code,
    });

    if (existingResult) {
      return res.status(200).json({
        existing: true,
        resultId: existingResult._id,
        message: "Result already saved. Try editing instead.",
      });
    }

    const newResult = new Result({
      staff: payload.staffId,
      session: payload.session,
      semester: payload.semester,
      level: payload.level,
      course: payload.course,
      isApprovedByHOD: false,
      isApprovedByDead: false,
      students: payload.students,
    });

    await newResult.save();

    return res.status(200).json({
      resultId: newResult._id,
      success: true,
      message: "Result saved successfully",
    });
  },

  //Result for OGR
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

  //Get result
  getResultToEdit: async (req, res) => {
    const { resultId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return response.send404(res, "Invalid result ID provided.");
    }

    const result = await Result.findById(resultId).lean();

    if (!result) {
      return response.send404(res, "Result not found");
    }

    if (result.isHODApproved || result.isDeanApproved) {
      return res.status(200).json({
        approved: true,
        resultId: result._id,
      });
    }

    //Get students who have registered for the course again because they may have not registered when the results were put in

    const registeredCourses = await RegisteredCourse.find({
      session: result.session,
      semester: result.semester,
      level: result.level,
    })
      .populate({
        path: "student",
        select: "user regNumber studentClass",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .lean();

    const filteredRecords = registeredCourses.filter((record) => {
      const existingStudent = result.students.find((student) => {
        return student.studentId.toString() === record.student._id.toString();
      });
      return (
        !existingStudent &&
        record.courses.some((c) => c.code === result.course.code)
      );
    });

    if (filteredRecords.length) {
      const students = filteredRecords.map((record) => {
        return {
          studentId: record.student._id,
          studentClassId: record.student.studentClass,
          regNumber: record.student.regNumber,
          ApprovedResult,
          name: record.student.user.name,
          year: record.year,
        };
      });

      result.students.push(...students);
    }

    result.students.sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json(result);
  },

  saveEditedResult: async (req, res) => {
    const result = req.body;
    if (!result) {
      return res.status(400).json({
        info: "Bad request.",
        message: "No body found with request.",
      });
    }

    await Result.updateOne(
      { _id: result._id },
      { $set: { students: result.students } },
    );

    return res.status(200).json({
      message: "Result edited successfully.",
      resultId: result._id,
    });
  },
};

module.exports = StaffController;
