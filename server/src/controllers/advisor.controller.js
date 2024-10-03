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

const response = require("../utils/response");
const excelToJson = require("convert-excel-to-json");
const XLSX = require("xlsx");
const normalizeName = require("../utils/normalize-name");

const { arrangeTranscriptData } = require("../utils/transcripts");

const AdvisorController = {
  getDashboardInfo: async (req, res) => {
    const userId = req.user._id;
    let dashboard = {};

    const [staff, currentSession, currentSemester] = await Promise.all([
      Staff.findOne(
        { user: userId, isAdvisor: true },
        { _id: 1, staffId: 1, courses: 1 },
      )
        .populate("courses")
        .populate("studentClass", "className currentlevel")
        .lean(),
      Session.findOne({ isCurrent: true }).lean(),
      Semester.findOne({ isCurrent: true }).lean(),
    ]);

    const [students, results, approvedResults] = await Promise.all([
      Student.countDocuments({ studentClass: staff.studentClass._id }),
      Result.countDocuments({ staff: staff._id }),
      ApprovedResult.find(
        { studentClass: staff.studentClass._id },
        { student: 1, totalUnits: 1, totalGradePoints: 1, GPA: 1 },
      )
        .populate({
          path: "student",
          select: "regNumber",
          populate: {
            path: "user",
            select: "name image",
          },
        })
        .lean(),
    ]);

    const topResults = approvedResults
      .reduce((acc, result) => {
        const existingStudentResult = acc.findIndex(
          (r) => r.student.toString() === result.student._id.toString(),
        );
        if (existingStudentResult !== -1) {
          acc[existingStudentResult].TGP += result.totalGradePoints || 0;
          acc[existingStudentResult].TNU += result.totalUnits || 0;
          acc[existingStudentResult].CGPA =
            acc[existingStudentResult].TGP / acc[existingStudentResult].TNU;
        } else {
          acc.push({
            student: result.student._id.toString(),
            name: result.student.user.name,
            regNumber: result.student.regNumber,
            TNU: result.totalUnits || 0,
            TGP: result.totalGradePoints || 0,
            CGPA: result.GPA || 0,
            iamge: result.student.user.image || "",
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.CGPA - a.CGPA)
      .slice(0, 10);

    dashboard = {
      staff,
      currentSession,
      currentSemester,
      results,
      students,
      topStudents: topResults,
    };
    return res.status(200).json(dashboard);
  },

  getStudentsInClass: async (req, res) => {
    const userId = req.user._id;

    const advisor = await Staff.findOne(
      { user: userId, isAdvisor: true },
      { studentClass: 1 },
    )
      .populate("studentClass", "className currentLevel")
      .lean();

    if (!advisor) {
      return response.send400(res, "Account not found!");
    }

    const classId = advisor.studentClass._id;

    const [students, sessions, courses] = await Promise.all([
      Student.find({ studentClass: classId }, { regNumber: 1, entryMode: 1 })
        .populate("user", "name sex image")
        .lean(),

      Session.find({}, { name: 1 }).lean(),

      Course.find({ schoolOfferingCourse: { $ne: 'SICT' } }, { code: 1, level: 1, semester: 1 }),
    ]);

    return res.status(200).json({ advisor, students, sessions, courses });
  },

  //Get profile of student
  getStudentProfile: async (req, res) => {
    const { id } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "The student ID supplied is invalid.",
      });
    }

    const student = await Student.findById(id)
      .populate("user", "name username email phoneNumber sex address image")
      .populate("studentClass", "className currentLevel")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "No student with the given ID was found",
      });
    }

    const [registeredCourses, advisor, results] = await Promise.all([
      RegisteredCourse.find({ student: student._id }).lean(),

      Staff.findOne(
        { isAdvisor: true, studentClass: student.studentClass._id },
        { user: 1 },
      )
        .populate("user", "name")
        .lean(),

      Result.find({ student: student._id }, { GPA: 1 }).lean(),
    ]);

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
            level: result.level,
            session: result.session,
            semester: result.semester,
          });
        }
      });
    });

    CGPA = TNU !== 0 ? TGP / TNU : 0;

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

    const outstandingCourses = failedCourses.filter(
      (courseA) =>
        !failedCourses.some(
          (courseB) => courseA.code === courseB.code && courseB.grade !== "F",
        ),
    );

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
      advisor: advisor.user.name,
      CGPA,
      registeredCourses,
      studentClass: student.studentClass.className,
      level: student.studentClass.currentLevel,
      userId: student.user._id,
      outstandingCourses,
    };

    return res.status(200).json(studentData);
  },

  //Check if transcripts exit
  checkStudentTranscripts: async (req, res) => {
    const { studentId } = req.query;
    const results = await ApprovedResult.find(
      { student: studentId },
      { _id: 1 },
    ).lean();

    if (!results.length) {
      return res.status(200).json({
        transcripts: false,
        message: "No approved results found for this student.",
      });
    }

    return res.status(200).json({
      transcripts: true,
      message: "Results found",
    });
  },

  //Generate student transcripts
  generateStudentTranscripts: async (req, res) => {
    const { studentId } = req.query;

    const results = await ApprovedResult.find({ student: studentId })
      .populate({
        path: "student",
        select: "user regNumber entryMode dateOfBirth nationality stateOfOrigin",
        populate: {
          path: "user",
          select: "name sex",
        },
        populate: {
          path: 'studentClass',
          select: 'className currentLevel'
        }
      })
      .lean();

    const arrangedResults = results.map((result) => {
      let reducedCourses = result.courses.map((course) => {
        return {
          code: course.code,
          title: course.title,
          unit: course.unit,
          grade: course.grade,
          gradePoints: course.gradePoints,
        };
      });
      // Return a new object with the reduced courses
      return {
        ...result,
        courses: reducedCourses,
      };
    });

    const student = { ...results[0].student };
    //results.student = student._id;

    const groupedResults = arrangedResults.reduce((acc, result) => {
      // Check if any existing result matches the session
      const existingGroup = acc.find(
        (group) => group[0]?.session === result.session,
      );
      // if the results have the same session, join them together
      if (existingGroup) {
        existingGroup.push(result);
      } else {
        // Otherwise, create a new group for the session
        acc.push([result]);
      }
      return acc;
    }, []);

    const transcripts = arrangeTranscriptData(groupedResults);

    return res.status(200).json({
      results: transcripts,
      student: student,
    });
  },

  //Get registered students to upload results
  getRegisteredClassStudents: async (req, res) => {
    const { staffId, session, semester, level, course } = req.query;
    if (!staffId || !session || !semester || !level || !course) {
      return response.send400(res, "All fields are required.");
    }

    const advisor = await Staff.findOne(
      { _id: staffId, isAdvisor: true },
      { studentClass: 1 },
    );

    if (!advisor) {
      return response.send400(res, "Advisor account not found.");
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
          studentClassId: advisor.studentClass,
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

    if (existingResult) {
      return res
        .status(200)
        .json({ existing: true, resultId: existingResult._id });
    }

    const filteredCourses = registeredCourses.filter((record) =>
      record.courses.some((c) => c.code === course),
    );

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

  //Result for OGR
  getClassOgrResult: async (req, res) => {
    const { session, semester, level, course } = req.query;

    const staff = await Staff.findOne(
      { user: req.user._id, isAdvisor: true },
      { _id: 1, studentClass: 1 },
    ).lean();

    if (!staff) {
      return response.send400(res, "No advisor account found.");
    }
    const result = await Result.findOne({
      session: session,
      semester: semester,
      level: parseInt(level),
      "course.code": course,
    }).lean();

    if (!result) {
      return response.send400(res, "The requested result was not found.");
    }

    const filteredStudents = result.students.filter((student) => {
      return (
        student.studentClassId.toString() === staff.studentClass.toString()
      );
    });

    result.students = filteredStudents;

    return res.status(200).json({ result, staff });
  },

  getClassResultToEdit: async (req, res) => {
    const { resultId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return response.send404(res, "Invalid result ID provided.");
    }

    const [advisor, result] = await Promise.all([
      Staff.findOne(
        { user: req.user._id, isAdvisor: true },
        { studentClass: 1 },
      ),

      Result.findById(resultId).lean(),
    ]);

    if (!advisor) {
      return response.send400(res, "Advisor account not found.");
    }

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
      studentClassId: advisor.studentClass,
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

  //Get class result to edit
  getResultToEdit: async (req, res) => {
    const { resultId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return response.send404(res, "Invalid result ID provided.");
    }

    const [advisor, result] = await Promise.all([
      Staff.findOne({ _id: staffId, isAdvisor: true }, { studentClass: 1 }),

      Result.findById(resultId).lean(),
    ]);

    if (!advisor) {
      return response.send400(res, "Advisor account not found.");
    }

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
      studentClassId: advisor.studentClass,
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

    if (registeredCourses.length) {
      const filteredCourses = registeredCourses.filter((record) =>
        record.courses.some((c) => c.code === result.course.code),
      );

      const students = filteredCourses.map((record) => {
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

  //Get class result all courses
  getClassResultAllCourses: async (req, res) => {
    const userId = req.user._id;

    const { session, semester, level } = req.query;

    const advisor = await Staff.findOne(
      { user: userId, isAdvisor: true },
      { studentClass: 1 },
    ).lean();

    if (!advisor) {
      return response.send400(res, "No advisor account found!");
    }

    let currentResults = await ApprovedResult.find({
      studentClass: advisor.studentClass,
      session: session,
      level: level,
      semester: semester,
    })
      .populate({
        path: "student",
        select: "regNumber",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .lean();

    if (!currentResults.length) {
      return response.send400(
        res,
        "No approved results found for the given query",
      );
    }

    //Get all the courses as a unique set
    let allCourses = new Set();

    currentResults.forEach((result) => {
      result.courses.forEach(({ code, unit }) => {
        allCourses.add(JSON.stringify({ code, unit }));
      });
    });

    // Convert the Set back to an array of objects
    const uniqueCoursesArray = Array.from(allCourses).map((courseString) =>
      JSON.parse(courseString),
    );

    // GET PREVIOUS RESULTS
    let promises = [];

    if (semester === "RAIN") {
      promises.push(
        ApprovedResult.find(
          {
            studentClass: advisor.studentClass,
            session: session,
            level: level,
            semester: { $ne: semester },
          },
          { courses: 0, session: 0, semester: 0, year: 0, level: 0 },
        ).lean(),
      );
    }

    promises.push(
      ApprovedResult.find(
        { studentClass: advisor.studentClass, level: { $lt: level } },
        { courses: 0, session: 0, semester: 0, year: 0, level: 0 },
      ).lean(),
    );

    const [result1, result2] = await Promise.all(promises);

    let previousResults =
      result2 && result2.length ? [...result1, ...result2] : [...result1];

    //console.log(previousResults)

    if (previousResults.length) {
      //If any previous results, calculate and add the previous and cummulative to the current results

      previousResults = previousResults.reduce((acc, result) => {
        let existingResultIndex = acc.findIndex(
          (r) => r.student.toString() === result.student.toString(),
        );

        if (existingResultIndex !== -1) {
          // If the student's result is already in the accumulator array
          acc[existingResultIndex].previousTotalUnits += result.totalUnits || 0;
          acc[existingResultIndex].previousTotalGradePoints +=
            result.totalGradePoints || 0;
          acc[existingResultIndex].previousGPA =
            acc[existingResultIndex].previousTotalGradePoints /
            acc[existingResultIndex].previousTotalUnits;
        } else {
          // If the student's result is not yet in the accumulator array
          let studentCummulativeResult = {
            student: result.student.toString(),
            previousTotalUnits: result.totalUnits || 0,
            previousTotalGradePoints: result.totalGradePoints || 0,
            previousGPA: result.GPA || 0,
          };

          acc.push(studentCummulativeResult);
        }
        return acc;
      }, []);

      //Join the previous results to the current one and calculate the cummulative
      let modifiedResults = [];

      // Iterate over currentResults
      currentResults.forEach((result) => {
        let modifiedResult = { ...result._doc }; // Create a copy of the result object

        // Find previous result for the current student
        const previousResult = previousResults.find(
          (r) => r.student.toString() === result.student._id.toString(),
        );

        // If previous result exists, modify the current result
        if (previousResult) {
          modifiedResult.previousTNU = previousResult.previousTotalUnits;
          modifiedResult.previousTGP = previousResult.previousTotalGradePoints;
          modifiedResult.previousGPA = previousResult.previousGPA;
          modifiedResult.cumTNU =
            previousResult.previousTotalUnits + result.totalUnits;
          modifiedResult.cumTGP =
            previousResult.previousTotalGradePoints + result.totalGradePoints;
          modifiedResult.cumGPA =
            modifiedResult.cumTNU !== 0
              ? modifiedResult.cumTGP / modifiedResult.cumTNU
              : 0; // Avoid division by zero
        }
        // Push the modified result into the new array
        modifiedResults.push(modifiedResult);
      });

      return res.status(200).json({
        success: true,
        previousResultsAvailable: true,
        courses: uniqueCoursesArray,
        records: modifiedResults,
      });
    }

    return res.status(200).json({
      success: true,
      previousResultsAvailable: false,
      courses: uniqueCoursesArray,
      records: currentResults,
    });
  },
};

module.exports = AdvisorController;
