require("dotenv").config();

const mongoose = require("mongoose");

const Student = require("../models/actors/student.model");
const Staff = require("../models/actors/staff.model");

const Session = require("../models/objects/session.model");
const Semester = require("../models/objects/semester.model");
const Course = require("../models/objects/course.model");
const CourseRegStatus = require("../models/objects/course-reg-status.model");
const ApprovedResult = require("../models/objects/approved-result.model");
const RegisteredCourse = require("../models/objects/registered-course.model");
const Level = require("../models/objects/level.model");

const response = require("../utils/response");

const StudentController = {
  getDashboardInfo: async (req, res) => {
    let dashboard = {};

    const [student, currentSession, currentSemester] = await Promise.all([
      Student.findOne(
        { user: req.user._id },
        { studentClass: 1, regNumber: 1, entryMode: 1 },
      )
        .populate("studentClass", "className currentLevel")
        .lean(),
      Session.findOne({ isCurrent: true }),
      Semester.findOne({ isCurrent: true }),
    ]);

    if (!student) {
      return response.send404(res, "The requested student was not found");
    }

    const [advisor, registeredCourses, results] = await Promise.all([
      Staff.findOne(
        { isAdvisor: true, studentClass: student.studentClass },
        { user: 1 },
      )
        .populate("user", "name")
        .lean(),

      RegisteredCourse.find({ student: student._id }, { courses: 1 }).lean(),

      ApprovedResult.find(
        { student: student._id },
        {
          courses: 1,
          session: 1,
          semester: 1,
          level: 1,
          totalUnits: 1,
          totalGradePoints: 1,
          GPA: 1,
        },
      ).lean(),
    ]);

    let totalCourses = 0;
    registeredCourses.forEach((record) => {
      totalCourses += record.courses.length;
    });

    let failedCourses = [];
    let CGPA = 0,
      TGP = 0,
      TNU = 0;

    results.forEach((result) => {
      TGP += result.totalGradePoints;
      TNU += result.totalUnits;

      result.courses.forEach((course) => {
        if (course.grade === "F") {
          failedCourses.push({
            code: course.code,
            title: course.title,
            grade: course.grade,
          });
        }
      });
    });

    CGPA = TNU !== 0 ? TGP / TNU : 0;

    formatedCGPA = +(Math.round(CGPA + "e+2") + "e-2");

    const outstandingCourses = failedCourses.filter((courseA) => {
      !failedCourses.some(
        (courseB) => courseA.code === courseB.code && courseB.grade !== "F",
      );
    });

    dashboard = {
      student: student,
      registeredCourses: totalCourses,
      references: outstandingCourses.length,
      results: results,
      CGPA: formatedCGPA,
      advisor: advisor.user.name,
      currentSession: currentSession,
      currentSemester: currentSemester,
      studentClass: student.studentClass,
    };

    return res.status(200).json(dashboard);
  },

  //Get details for Student courses page
  getCourseRegistrationStatus: async (req, res) => {
    const userId = req.user._id;

    const student = await Student.findOne({ user: userId }, { studentClass: 1 })
      .populate("studentClass", "currentLevel")
      .lean();

    if (!student) return response.send400(res, "Student not found");

    const [courseRegStatus, history, currentSemester] = await Promise.all([
      CourseRegStatus.findOne({}).lean(),

      RegisteredCourse.find(
        { student: student._id },
        { session: 1, semester: 1, level: 1 },
      ).lean(),

      Semester.findOne({ isCurrent: true }).lean(),
    ]);

    const semesterCourses = await Course.find({
      semester: currentSemester.name,
      level: student.studentClass.currentLevel,
    });
    const payload = {
      studentClass: student.studentClass,
      courseRegStatus,
      history,
      semesterCourses,
    };
    return res.status(200).json(payload);
  },

  //Get courses to register
  getCourseToRegister: async (req, res) => {
    let { session, semester, level } = req.params;

    if (!session || !semester) {
      return response.send400(res, "Invalid request parameters");
    }

    semester = semester.toUpperCase();

    const userId = req.user._id;

    const [student, courseRegStatus] = await Promise.all([
      Student.findOne({ user: userId }, { studentClass: 1 })
        .populate("studentClass", "currentLevel")
        .lean(),

      CourseRegStatus.findOne({}).lean(),
    ]);

    if (!student) return response.send400(res, "Student not found");

    const { openSessions, openSemesters, openLevels } = courseRegStatus;

    const allLevels = [
      ...new Set([student.studentClass.currentLevel, ...openLevels]),
    ];

    const isSessionOpen = openSessions.some((sess) => sess === session);
    const isSemesterOpen = openSemesters.some(
      (sem) => sem.toLowerCase() === semester.toLowerCase(),
    );
    const isLevelOpen = allLevels.some(
      (lev) => parseInt(lev) === parseInt(level),
    );

    if (!isSessionOpen || !isSemesterOpen || !isLevelOpen) {
      return response.send403(
        res,
        "Registration for the selected session, semester, and level is not open",
      );
    }

    const [courses, selectedLevel] = await Promise.all([
      Course.find({ semester: semester, level: level }).lean(),
      Level.findOne({ name: level }).lean(),
    ]);

    const year = parseInt(student.studentClass.currentLevel) / 100;

    const payload = {
      courses: courses,
      session: session,
      semester: semester,
      level: selectedLevel,
      year: year,
    };

    return res.status(200).json(payload);
  },

  //Get courses to borrow
  getCoursesToBorrow: async (req, res) => {
    const { level, semester } = req.query;

    if (!level || !semester) {
      return response.send400(res, "No level or semester provided");
    }

    const courses = await Course.find({
      level: level,
      semester: semester,
    }).lean();

    return res.status(200).json(courses);
  },

  //Register courses
  registerCourses: async (req, res) => {
    const userId = req.user._id;

    const payload = req.body;

    const student = await Student.findOne(
      { user: userId },
      { _id: 1, studentClass: 1 },
    ).lean();

    let existingCourseReg = await RegisteredCourse.findOne({
      student: student._id,
      session: payload.session,
      semester: payload.semester,
      level: payload.level,
      year: payload.year,
    });

    if (existingCourseReg) {
      await RegisteredCourse.updateOne(
        { _id: existingCourseReg._id },
        { $set: payload },
      );

      return res
        .status(200)
        .json({ message: "Course registration completed." });
    }

    const registeredCourses = new RegisteredCourse({
      student: student._id,
      courses: payload.courses,
      studentClassId: student.studentClass,
      session: payload.session,
      semester: payload.semester,
      level: payload.level,
      year: payload.year,
      totalUnits: payload.totalUnits,
    });

    await registeredCourses.save();

    return res.status(200).json({ message: "Course registration completed." });
  },

  //GETS LIST OF RESULTS FOR STUDENT
  getListOfResults: async (req, res) => {
    const student = await Student.findOne(
      { user: req.user._id },
      { _id: 1 },
    ).lean();
    let results = await ApprovedResult.find({ student: student._id }).lean();

    results = results.map((result) => {
      return {
        _id: result._id,
        session: result.session,
        semester: result.semester,
        level: result.level,
        courses: result.courses.length,
        GPA: result.GPA,
        timestamp: result.updatedAt,
      };
    });
    return res.status(200).json(results);
  },

  //GETS A SINGLE RESULT FOR THE STUDENT TO VIEW
  getSingleResult: async (req, res) => {
    const resultId = req.params.id;
    if (!resultId || !mongoose.Types.ObjectId.isValid(resultId)) {
      return response.send400(res, 'Invalid result ID provided');
    }
    const result = await ApprovedResult.findById(resultId).populate("student", "regNumber");
    if (!result) {
      return res.status(404).json({
        info: "Not found",
        message: "No approved results found",
      });
    }
    return res.status(200).json(result);
  },

  //Gets student's profile
  getProfile: async (req, res) => {
    const student = await Student.findOne({ user: req.user._id })
      .populate("user", "name username email phoneNumber sex address image")
      .populate("studentClass", "className currentLevel")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "No student with the given ID was found",
      });
    }

    const {
      _id,
      regNumber,
      entryMode,
      dateOfBirth,
      nationality,
      stateOfOrigin,
    } = student;
    const { name, username, email, phoneNumber, sex, address, image } =
      student.user;

    const studentData = {
      _id,
      name,
      username,
      email,
      phoneNumber,
      sex,
      address,
      image,
      regNumber,
      entryMode,
      dateOfBirth,
      nationality,
      stateOfOrigin,
      studentClass: student.studentClass.className,
      level: student.studentClass.currentLevel,
      userId: student.user._id,
    };

    return res.status(200).json(studentData);
  },
};

module.exports = StudentController;
