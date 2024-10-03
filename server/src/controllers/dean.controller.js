require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const path = require("node:path");
const fs = require("node:fs");

const User = require("../models/actors/user.model");
const Dean = require("../models/actors/dean.model");

const Session = require("../models/objects/session.model");
const Semester = require("../models/objects/semester.model");
const Result = require("../models/objects/result.model");
const ApprovedResult = require("../models/objects/approved-result.model");

const response = require("../utils/response");
const { getGradePoints } = require("../utils/transcripts");

const DeanController = {
  //Dashboard details
  getDashboardInfo: async (req, res) => {
    let dashboard = {};

    const [currentSession, currentSemester, pendingResults, advisors] =
      await Promise.all([
        Session.findOne({ isCurrent: true }).lean(),
        Semester.findOne({ isCurrent: true }).lean(),
        Result.countDocuments({ isHODApproved: true, isDeanApproved: false }),
      ]);

    dashboard = {
      currentSession,
      currentSemester,
      pendingResults,
    };
    return res.status(200).json(dashboard);
  },

  //Gets pending results created within the last 6 months
  getPendingResults: async (req, res) => {
    const results = await Result.find(
      { isHODApproved: true, isDeanApproved: false },
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
      Dean.findOne({ user: req.user._id }, { _id: 1 }).lean(),
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

    const result = await Result.findById(resultId);

    await Promise.all(
      result.students.map(async (student) => {
        let existingResult = await ApprovedResult.findOne({
          student: student.studentId,
          year: student.year,
          session: result.session,
          semester: result.semester,
          level: result.level,
        });

        if (existingResult) {
          existingResult.courses.push({
            code: result.course.code,
            title: result.course.title,
            isElective: result.course.isElective,
            hasPractical: result.course.hasPractical,
            level: result.course.level,
            unit: result.course.unit,
            testScore: student.testScore,
            labScore: student.labScore,
            examScore: student.examScore,
            totalScore: student.totalScore,
            grade: student.grade,
            remark: student.remark,
            gradePoints: getGradePoints(student.grade, result.course.unit),
          });

          await existingResult.save();
          return existingResult;
        } else {
          existingResult = new ApprovedResult({
            student: student.studentId,
            session: result.session,
            semester: result.semester,
            level: result.level,
            studentClass: student.studentClassId,
            year: student.year,
            courses: [
              {
                code: result.course.code,
                title: result.course.title,
                isElective: result.course.isElective,
                hasPractical: result.course.hasPractical,
                level: result.course.level,
                unit: result.course.unit,
                testScore: student.testScore,
                labScore: student.labScore,
                examScore: student.examScore,
                totalScore: student.totalScore,
                grade: student.grade,
                remark: student.remark,
                gradePoints: getGradePoints(student.grade, result.course.unit),
              },
            ],
          });

          await existingResult.save();
          return existingResult;
        }
      }),
    );

    result.isDeanApproved = true;
    result.deanDisapproved = {
      isDisapproved: false,
      reason: "",
    };
    await result.save();

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
      isDeanApproved: false,
      DeanDisapproved: {
        isDisapproved: true,
        reason: reason,
      },
    };

    await Result.updateOne({ _id: resultId }, { $set: edits });

    return res
      .status(200)
      .json({ success: true, message: "Result disapproved" });
  },
  /* disapproveResult: async (req, res) => {
    const resultId = req.params.id;
    const { reason } = req.body;

    if (!resultId || !mongoose.Types.ObjectId.isValid(resultId)) {
      return response.send400(res, 'Invalid result ID provided');
    }

    const result = await Result.findById(resultId)
    const studentIds = result.students.map(student => student.studentId);

    const approvedResults = await ApprovedResult.find({
      student: { $in: studentIds },
      session: result.session,
      semester: result.semester,
      level: result.level,
    });

    const bulkOps = [];

    for (let approvedResult of approvedResults) {
      approvedResult.courses = approvedResult.courses.filter(course => course.code !== result.course.code);

      if (approvedResult.courses.length) {
        bulkOps.push({
          updateOne: {
            filter: { _id: approvedResult._id },
            update: { $set: { courses: approvedResult.courses } },
          },
        });
      } else {
        bulkOps.push({
          deleteOne: {
            filter: { _id: approvedResult._id },
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      await ApprovedResult.bulkWrite(bulkOps);
    }

    
    result.isDeanApproved = false;
    result.deanDisapproved = {
      isDisapproved: true,
      reason: reason
    }

    await result.save();
    
    return res.status(200).json({ success: true, message: 'Result disapproved' });
  }, */

  getProfile: async (req, res) => {
    const id = req.user._id;
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!id || !isValid)
      return response.send400(res, "The staff ID supplied is invalid.");

    const staff = await Dean.findOne({ user: id })
      .populate(
        "user",
        "name title username email phoneNumber sex address image",
      )
      .lean();

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "No staff with the given ID was found",
      });
    }

    const {
      _id,
      staffId,
      school,
    } = staff;

    const { name, username, email, phoneNumber, sex, address, image } =
      staff.user;

    const staffData = {
      _id,
      name,
      username,
      email,
      phoneNumber,
      sex,
      address,
      image,
      staffId,
      school,
      userId: staff.user._id,
    };
    return res.status(200).json(staffData);
  }
};

module.exports = DeanController;
