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

const { validateInput } = require("../utils/validate");
const response = require("../utils/response");
const excelToJson = require("convert-excel-to-json");
const XLSX = require("xlsx");
const normalizeName = require("../utils/normalize-name");

const AdminController = {
  //Dashboard info
  getDashboardInfo: async (req, res) => {
    const [
      classes,
      students,
      staffs,
      courses,
      currentSemester,
      currentSession,
      courseRegStatus,
      leaders,
    ] = await Promise.all([
      StudentClass.estimatedDocumentCount(),
      Student.estimatedDocumentCount(),
      Staff.countDocuments({ isActive: true }),
      Course.estimatedDocumentCount(),
      Semester.findOne({ isCurrent: true }).lean(),
      Session.findOne({ isCurrent: true }).lean(),
      CourseRegStatus.findOne().lean(),
      User.find(
        { $or: [{ role: "HOD" }, { role: "DEAN" }] },
        { name: 1, title: 1, role: 1, image: 1 },
      ).lean(),
    ]);

    const data = {
      classes,
      students,
      staffs,
      courses,
      currentSemester,
      currentSession,
      courseRegStatus,
      leaders,
    };

    return res.status(200).json(data);
  },

  //Get admins
  getAdmins: async (req, res) => {
    const admins = await User.find(
      { role: "ADMIN" },
      {
        name: 1,
        title: 1,
        username: 1,
        email: 1,
        phoneNumber: 1,
        image: 1,
        sex: 1,
        address: 1,
      },
    ).lean();
    return res.status(200).json(admins);
  },

  addAdmin: async (req, res) => {
    const payload = req.body;
    if (!payload) {
      return response.send400(res, "No details provided");
    }

    const query = [{ username: payload.username }];
    if (payload.email) query.push({ email: payload.email });
    if (payload.phoneNumber) query.push({ phoneNumber: payload.phoneNumber });

    const existingUser = await User.find({ $or: query }, { _id: 1 }).lean();

    if (existingUser.length) {
      return response.send400(
        res,
        "An admin with this username, email or phone number already exists",
      );
    }
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const newAdmin = await User.create({
      name: payload.name,
      title: payload.title,
      username: payload.username,
      role: "ADMIN",
      password: hashedPassword,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      sex: payload.sex,
      address: payload.address,
    });

    await newAdmin.save();

    const data = {
      name: newAdmin.name,
      title: newAdmin.title,
      username: newAdmin.username,
      role: "ADMIN",
      email: newAdmin.email,
      phoneNumber: newAdmin.phoneNumber,
      sex: newAdmin.sex,
      address: newAdmin.address,
    };

    return res.status(200).json(data);
  },

  removeAdmin: async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
      return response.send400(res, "No user ID provided");
    }

    const imageDir = path.resolve("src/assets/admins");

    const existingImage = fs
      .readdirSync(imageDir)
      .find((file) => file.startsWith(userId + "."));

    if (existingImage) {
      fs.unlinkSync(path.join(imageDir, existingImage));
    }

    await User.deleteOne({ _id: userId });

    return res.status(200).json({ message: "Admin removed" });
  },

  //Search actors
  searchActors: async (req, res) => {
    let { value, model, limit, skip } = req.query;
    skip = parseInt(skip);
    limit = parseInt(limit);

    const regex = new RegExp(value, "i");

    let results = [];
    if (model.toLowerCase() === "student") {
      results = await Student.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $match: {
            $or: [{ "userDetails.name": regex }, { regNumber: regex }],
          },
        },
        {
          $project: {
            _id: 1,
            user: 1,
            regNumber: 1,
            "userDetails.name": 1,
            "userDetails.image": 1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);
    }

    if (model.toLowerCase() === "staff") {
      results = await Staff.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $match: {
            $or: [{ "userDetails.name": regex }, { staffId: regex }],
          },
        },
        {
          $project: {
            _id: 1,
            user: 1,
            staffId: 1,
            "userDetails.name": 1,
            "userDetails.image": 1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);
    }
    return res.status(200).json(results);
  },

  //STUDENT API
  //Get students
  getStudents: async (req, res) => {
    const { skip, limit } = req.query;
    validateInput(res, limit, "limit");

    const [students, numberOfStudents] = await Promise.all([
      Student.find({}, { regNumber: 1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name image")
        .populate("studentClass", "currentLevel")
        .lean(),

      Student.estimatedDocumentCount(),
    ]);

    return res.status(200).json({ students, numberOfStudents });
  },

  //Add student
  addStudent: async (req, res) => {
    const payload = req.body;

    const query = [{ username: payload.username }];
    if (payload.email) query.push({ email: payload.email });
    if (payload.phoneNumber) query.push({ phoneNumber: payload.phoneNumber });

    const existingUser = await User.find(
      { $or: query },
      { username: 1 },
    ).lean();

    if (existingUser.length) {
      return response.send400(
        res,
        "A student with this username, email or phone number already exists",
      );
    }

    const studentClass = await StudentClass.findOne(
      { className: payload.className },
      { _id: 1, currentLevel: 1 },
    ).lean();

    if (!studentClass) {
      return response.send400(res, "The selected class does not exist.");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const newUser = await User.create({
      name: payload.name,
      username: payload.username,
      role: payload.role,
      password: hashedPassword,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      sex: payload.sex,
      address: payload.address,
    });

    const newStudent = await Student.create({
      user: newUser._id,
      studentClass: studentClass._id,
      regNumber: payload.regNumber,
      entryMode: payload.entryMode,
      dateOfBirth: payload.dateOfBirth,
      nationality: payload.nationality,
      stateOfOrigin: payload.stateOfOrigin,
    });

    return res.status(200).json({
      _id: newStudent._id,
      user: { name: newUser.name },
      regNumber: newStudent.regNumber,
      studentClass: { currentLevel: studentClass.currentLevel },
      sex: newStudent.sex,
      entryMode: newStudent.entryMode,
    });
  },

  //Get student profile
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

      ApprovedResult.find({ student: student._id }, { GPA: 1 }).lean(),
    ]);

    let CGPA = 0,
      TGP = 0,
      TNU = 0;

    results.forEach((result) => {
      TGP += result.totalGradePoints;
      TNU += result.totalUnits;
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
    };

    return res.status(200).json(studentData);
  },

  //Change student name or regNumber
  changeStudentNameOrRegNumber: async (req, res) => {
    const { userId, studentId } = req.params;
    if (!userId || !studentId)
      return response.send400(res, "No user or student ID provided");

    const isValid =
      mongoose.Types.ObjectId.isValid(userId) &&
      mongoose.Types.ObjectId.isValid(studentId);
    if (!isValid)
      return response.send400(res, "Invalid user or student ID provided.");

    const { name, regNumber } = req.body;
    if (!name || !regNumber)
      return response.send400(res, "No name or reg number provided.");

    await Promise.all([
      Student.updateOne({ _id: studentId }, { $set: { regNumber: regNumber } }),
      User.updateOne({ _id: userId }, { $set: { name: name } }),
    ]);
    return res.status(200).json({ name, regNumber });
  },

  //STAFF APIs
  //Get all staff
  getStaffs: async (req, res) => {
    const { skip, limit } = req.query;
    validateInput(res, limit, "limit");

    const [staffs, numberOfStaffs] = await Promise.all([
      Staff.find(
        {},
        { isHOD: 1, staffId: 1, qualification: 1, specialization: 1, rank: 1 },
      )
        .skip(skip)
        .limit(limit)
        .populate("user", "name image")
        .lean(),

      Staff.estimatedDocumentCount(),
    ]);

    return res.status(200).json({ staffs, numberOfStaffs });
  },

  getAllStaffs: async (req, res) => {
    const staffs = await Staff.find(
      {},
      {
        user: 1,
        isHOD: 1,
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

    /*  const [ staff, results ] = await Promise.all([
      Staff.findById(id)
      .populate('user', 'name title username email phoneNumber sex address image')
      .populate('studentClass', 'className currentLevel')
      .populate('courses', 'code title')
      .lean(),
      
      Result.find({ staff: id }, { course: 1, session: 1, level: 1, semester: 1 }).lean()
    ]); */

    //staff.results = results;

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

  //Change staff details
  changeStaffDetails: async (req, res) => {
    const { userId, staffId } = req.params;
    if (!userId || !staffId)
      return response.send400(res, "No user or staff ID provided");

    const isValid =
      mongoose.Types.ObjectId.isValid(userId) &&
      mongoose.Types.ObjectId.isValid(staffId);

    if (!isValid)
      return response.send400(res, "Invalid user or staff ID provided.");

    const { name, title, staffId: employeeId, rank, isActive } = req.body;
    if (!name || !employeeId || !rank)
      return response.send400(res, "No details provided.");

    await Promise.all([
      Staff.updateOne(
        { _id: staffId },
        { $set: { staffId: employeeId, rank: rank, isActive: isActive } },
      ),
      User.updateOne({ _id: userId }, { $set: { name: name, title: title } }),
    ]);
    return res.status(200).json({ name, title, employeeId, rank, isActive });
  },

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

  addStaffCourses: async (req, res) => {
    const staffId = req.params.staffId;
    if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
      return response.send400(res, "Invalid staff ID provided");
    }
    const courses = req.body;
    const courseIds = courses.map((course) => course._id);
    await Staff.updateOne(
      { _id: staffId },
      { $addToSet: { courses: { $each: courseIds } } },
    );
    return res.status(200).json({ message: "Courses added successfully" });
  },

  removeStaffCourses: async (req, res) => {
    const staffId = req.params.staffId;
    if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
      return response.send400(res, "Invalid staff ID provided");
    }

    const courses = req.body.courses;

    if (!courses.length) {
      await Staff.updateOne({ _id: staffId }, { $set: { courses: [] } });
      return res.status(200).json({ message: "All courses removed" });
    }

    const courseIds = courses.map((course) => course._id);

    await Staff.updateOne(
      { _id: staffId },
      { $pull: { courses: { $in: courseIds } } },
    );

    return res.status(200).json({ message: "Selected courses removed." });
  },

  //Get all advisors
  getAdvisors: async (req, res) => {
    const advisors = await Staff.find(
      { isAdvisor: true },
      { staffId: 1, rank: 1 },
    )
      .populate("user", "name image")
      .populate("studentClass", "className currentLevel")
      .lean();

    return res.status(200).json(advisors);
  },

  //HOD AND DEAN

  hodAndDean: async (req, res) => {
    const [hod, dean] = await Promise.all([
      Staff.findOne({ isHOD: true })
        .populate("user", "name title username email phoneNumber image")
        .lean(),

      Dean.findOne({})
        .populate("user", "name title username email phoneNumber image")
        .lean(),
    ]);
    return res.status(200).json({ hod, dean });
  },

  changeHod: async (req, res) => {
    const staff = req.body;
    if (!staff) return response.send400(res, "No staff provided");

    let newHod = await Staff.findOne({ _id: staff._id }).populate(
      "user",
      "name title username email phoneNumber image",
    );

    if (!newHod)
      return response.send400(res, "The requested staff was not found.");

    let user = await User.findById(newHod.user._id);

    if (!user) return response.send400(res, "The requested user was not found");

    (user.role = "HOD"), (newHod.isHOD = true);

    await Promise.all([user.save(), newHod.save()]);

    return res.status(200).json(newHod);
  },

  addDean: async (req, res) => {
    const payload = req.body;
    if (!payload) return response.send400(res, "No Dean details provided.");

    let { create } = req.query;

    if (!create) create = "true";

    const deans = await Dean.countDocuments();
    if (deans > 1)
      return response.send400(res, "A Dean account already exists");

    if (create === "true") {
      const hashedPassword = await bcrypt.hash(payload.password, 10);

      const newUser = await User.create({
        name: payload.name,
        title: payload.title,
        username: payload.username,
        role: "DEAN",
        password: hashedPassword,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        sex: payload.sex,
        address: payload.address,
      });

      const newDean = await Dean.create({
        user: newUser._id,
        staffId: payload.staffId,
        school: {
          acronymn: "SICT",
          fullName: "School of Information and Communication Technology",
        },
      });

      return res.status(200).json({
        _id: newDean._id,
        user: {
          _id: newUser._id,
          name: newUser.name,
          title: newUser.title,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          sex: newUser.sex,
          address: newUser.address,
          image: "",
        },
        staffId: newDean.staffId,
      });
    }

    if (create === "false") {
      const { deanId } = req.query;

      if (!deanId || !mongoose.Types.ObjectId.isValid(deanId)) {
        return response.send400(res, "Invalid Dean ID provided");
      }

      const imageDir = path.resolve("src/assets/staffs");
      //Make sure the directory exists;
      fs.mkdirSync(imageDir, { recursive: true });

      const existingImage = fs
        .readdirSync(imageDir)
        .find((file) => file.startsWith(deanId + "."));

      if (existingImage) {
        fs.unlinkSync(path.join(imageDir, existingImage));
      }

      const oldDean = await Dean.findByIdAndDelete(deanId);
      if (oldDean) {
        await User.deleteOne({ _id: oldDean.user });
      }

      const hashedPassword = await bcrypt.hash(payload.password, 10);

      const newUser = await User.create({
        name: payload.name,
        title: payload.title,
        username: payload.username,
        role: "DEAN",
        password: hashedPassword,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        sex: payload.sex,
        address: payload.address,
      });

      const newDean = await Dean.create({
        user: newUser._id,
        staffId: payload.staffId,
        school: {
          acronymn: "SICT",
          fullName: "School of Information and Communication Technology",
        },
      });

      return res.status(200).json({
        _id: newDean._id,
        user: {
          _id: newUser._id,
          name: newUser.name,
          title: newUser.title,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          sex: newUser.sex,
          address: newUser.address,
        },
        staffId: newDean.staffId,
      });
    }
  },

  changeDeanDetails: async (req, res) => {
    const edit = req.body;
    if (!edit) return response.send400(res, "No details provided.");

    const { deanId, userId } = req.query;
    if (!deanId || !mongoose.Types.ObjectId.isValid(deanId))
      return response.send400(res, "Invalid dean ID provided");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId))
      return response.send400(res, "Invalid user ID provided");

    const { name, title, staffId } = edit;

    await Promise.all([
      Dean.updateOne({ _id: deanId }, { $set: { staffId: staffId } }),
      User.updateOne({ _id: userId }, { $set: { name: name, title: title } }),
    ]);
    return res.status(200).json({ name, title, staffId });
  },

  //COURSES APIs
  getCourses: async (req, res) => {
    const { fields } = req.query;
    const query = {};
    if (fields) {
      const fieldArray = fields.split(",");
      fieldArray.forEach((field) => {
        field.trim();
        query[field] = 1;
      });
      const courses = await Course.find({}, query).lean();
      return res.status(200).json(courses);
    }
    const courses = await Course.find().lean();
    return res.status(200).json(courses);
  },

  //Create or edot course
  manageCourse: async (req, res) => {
    const { create } = req.query;
    const payload = req.body;
    let course;
    if (create === "yes") {
      course = new Course(payload);
      await course.save();
    } else if (create === "no") {
      course = await Course.findByIdAndUpdate(
        payload._id,
        { $set: payload },
        { new: true },
      );
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid query",
      });
    }

    return res.status(200).json(course);
  },

  //Delete course
  deleteCourse: async (req, res) => {
    const { id } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "The course ID supplied is invalid.",
      });
    }
    await Course.deleteOne({ _id: id });
    return res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
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

  uploadClassList: async (req, res) => {
    const { classList } = req.files;
    const { classId } = req.body;
    const isValid = mongoose.Types.ObjectId.isValid(classId);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "The class ID supplied is invalid.",
      });
    }
    if (!classList) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "No class list uploaded.",
      });
    }

    const ext = classList.name.split(".").pop();

    const isValidExcelFile = ext.includes("xls") || ext.includes("xlsx");
    if (!isValidExcelFile) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message:
          "Invalid file format. Only Excel (.xls,.xlsx) files are accepted.",
      });
    }

    let result, classListData;
    try {
      result = excelToJson({
        source: classList.data,
        header: {
          rows: 1,
        },
        sheets: ["Sheet1"],
        columnToKey: {
          A: "fullName",
          B: "regNumber",
        },
      });

      classListData = result.Sheet1.map((student) => {
        return {
          name: normalizeName(student.fullName),
          regNumber: student.regNumber.toString(),
        };
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message:
          "Error processing Excel file. Check the guidelines and try again.",
      });
    }

    const processStudent = async (
      student,
      classId,
      duplicateStudents,
      addedStudents,
    ) => {
      try {
        const [existingUser, existingStudent] = await Promise.all([
          User.find({ username: student.regNumber }),
          Student.find({ regNumber: student.regNumber }),
        ]);

        if (existingUser.length || existingStudent.length) {
          duplicateStudents.push(student);
          return;
        }

        const hashedPassword = await bcrypt.hash(student.regNumber, 10);

        const newUser = await User.create({
          name: student.name,
          username: student.regNumber,
          password: hashedPassword,
          role: "STUDENT",
        });

        const newStudent = await Student.create({
          user: newUser._id,
          studentClass: classId,
          regNumber: student.regNumber,
        });

        addedStudents.push({
          regNumber: newStudent.regNumber,
          user: {
            _id: newUser._id,
            name: newUser.name,
          },
        });
      } catch (error) {
        console.error("Error processing student:", error);
        return res.status(500).send("Error processing student: " + error);
      }
    };

    const processClassList = async (classList, classId) => {
      const duplicateStudents = [];
      const addedStudents = [];

      await Promise.all(
        classList.map((student) =>
          processStudent(student, classId, duplicateStudents, addedStudents),
        ),
      );

      return { duplicateStudents, addedStudents };
    };

    // Usage
    const { duplicateStudents, addedStudents } = await processClassList(
      classListData,
      classId,
    );

    return res.status(200).json({ addedStudents, duplicateStudents });
  },

  downloadClassList: async (req, res) => {
    const { classId } = req.query;
    const isValid = mongoose.Types.ObjectId.isValid(classId);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "The class ID supplied is invalid.",
      });
    }

    const payload = await Student.find(
      { studentClass: classId },
      { regNumber: 1 },
    )
      .populate("user", "name")
      .sort({ "user.name": 1 })
      .lean();

    const students = payload.map((student) => {
      return {
        fullName: student.user.name,
        regNumber: student.regNumber,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();

    const max_width = students.reduce(
      (w, r) => Math.max(w, r.fullName.length),
      10,
    );
    worksheet["!cols"] = [{ wch: max_width }];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.utils.sheet_add_aoa(worksheet, [["Name", "Reg. Number"]], {
      origin: "A1",
    });

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=class_list.xlsx`,
    );

    return res.status(200).send(excelBuffer);
  },

  //Get students in class
  getStudentsInClass: async (req, res) => {
    const classId = req.params.id;
    const isValid = mongoose.Types.ObjectId.isValid(classId);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "The class ID supplied is invalid.",
      });
    }

    const [studentClass, students] = await Promise.all([
      StudentClass.findById(classId),

      Student.find({ studentClass: classId }, { regNumber: 1, entryMode: 1 })
        .populate("user", "name sex image")
        .lean(),
    ]);
    return res.status(200).json({ studentClass, students });
  },

  //Create or edit class
  manageClass: async (req, res) => {
    const payload = req.body;
    const { create } = req.query;

    if (create === "yes") {
      //Create a new class
      const newAdvisor = payload.newAdvisor;

      const data = {
        className: payload.className,
        currentLevel: payload.currentLevel,
        enrolmentYear: payload.enrolmentYear,
        isActive: payload.isActive,
        advisor: newAdvisor ? newAdvisor._id : null,
      };

      const studentClass = new StudentClass(data);
      await studentClass.save();

      const query = [];

      if (newAdvisor) {
        query.push(
          // Remove newAdvisor from old class
          StudentClass.updateOne(
            { advisor: newAdvisor._id },
            { $set: { advisor: null } },
          ),

          // Change new advisor's role to 'ADVISOR'
          User.updateOne(
            { _id: newAdvisor.user._id },
            { $set: { role: "ADVISOR" } },
          ),

          // Add the classId to the new advisor's info
          Staff.updateOne(
            { _id: newAdvisor._id },
            { $set: { studentClass: studentClass._id, isAdvisor: true } },
          ),
        );
      }

      query.length && (await Promise.all(query));

      studentClass.advisor = newAdvisor;

      return res.status(200).json(studentClass);
    } else if (create === "no") {
      const oldAdvisor = payload.advisor;
      const newAdvisor = payload.newAdvisor;
      let data, studentClass;

      if (!newAdvisor) {
        if (oldAdvisor) {
          if (oldAdvisor._id) advisorId = oldAdvisor._id;
          else advisorId = oldAdvisor;
        } else {
          advisorId = null;
        }
        data = {
          className: payload.className,
          currentLevel: payload.currentLevel,
          enrolmentYear: payload.enrolmentYear,
          isActive: payload.isActive,
          advisor: advisorId,
        };

        studentClass = await StudentClass.findByIdAndUpdate(
          payload._id,
          { $set: data },
          { new: true },
        );

        return res.status(200).json(studentClass);
      }

      //If there is a new advisor while editing
      data = {
        className: payload.className,
        currentLevel: payload.currentLevel,
        enrolmentYear: payload.enrolmentYear,
        isActive: payload.isActive,
        advisor: newAdvisor._id,
      };

      const query = [
        // Remove newAdvisor from old class
        StudentClass.updateOne(
          { advisor: newAdvisor._id },
          { $set: { advisor: null } },
        ),
        // Add the new advisor's Id to the edited class
        StudentClass.findByIdAndUpdate(
          payload._id,
          { $set: { advisor: newAdvisor._id } },
          { new: true },
        ),
        // Change new advisor's role to 'ADVISOR'
        User.updateOne(
          { _id: newAdvisor.user._id },
          { $set: { role: "ADVISOR" } },
        ),
        // Add the classId to the new advisor's info
        Staff.updateOne(
          { _id: newAdvisor._id },
          { $set: { studentClass: payload._id, isAdvisor: true } },
        ),
      ];

      if (oldAdvisor) {
        if (oldAdvisor._id.toString() === newAdvisor._id.toString()) {
          studentClass = await StudentClass.findByIdAndUpdate(
            payload._id,
            { $set: data },
            { new: true },
          );

          return res.status(200).json(studentClass);
        }

        query.push(
          // Change old advisor to 'STAFF'
          User.updateOne(
            { _id: oldAdvisor.user._id },
            { $set: { role: "STAFF" } },
          ),
          // Remove studentClass from old advisor's info
          Staff.updateOne(
            { _id: oldAdvisor._id },
            { $set: { studentClass: null, isAdvisor: false } },
          ),
        );
      }

      const [editedClass] = await Promise.all(query);
      studentClass = editedClass;

      return res.status(200).json(studentClass);
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid query",
      });
    }
  },

  //Delete course
  deleteClass: async (req, res) => {
    const { id } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "The course ID supplied is invalid.",
      });
    }

    const students = await Student.find({ studentClass: id })
      .populate("studentClass", "className")
      .lean();

    students.forEach((student) => {
      const uploadDir = path.resolve(
        "src/assets/students",
        student.studentClass.className,
      );

      const existingImage = fs
        .readdirSync(uploadDir)
        .find((file) => file.startsWith(student.user.toString() + "."));

      if (existingImage) {
        fs.unlinkSync(path.join(uploadDir, existingImage));
      }
    });

    await Promise.all([
      StudentClass.deleteOne({ _id: id }),
      ApprovedResult.deleteMany({ studentClassId: id }),
      Staff.updateOne(
        { isAdvisor: true, studentClass: id },
        { $set: { studentClass: null } },
      ),
    ]);

    await Promise.all(
      students.map(async (student) => {
        await User.deleteOne({ _id: student.user });
        await Student.deleteOne({ _id: student._id });
      }),
    );

    //Delete class
    //delete all students in class where classId,
    //Delete users;
    //Delete approved results where classId
    //Delete classList where classId
    //Delete registered courses were studentClassId
    //Remove class from advisor record
    return res
      .status(200)
      .json({ success: true, message: "Class deleted successfully" });
  },

  //SETTINGS

  getSettings: async (req, res) => {
    let data = {};
    const [sessions, currentSemester, courseRegistration] = await Promise.all([
      Session.find().lean(),
      Semester.findOne({ isCurrent: true }).lean(),
      CourseRegStatus.findOne({ name: "courseRegistrationStatus" }).lean(),
    ]);
    const currentSession = sessions.find((session) => session.isCurrent);
    data = {
      sessions,
      currentSession,
      currentSemester,
      courseRegistration,
    };

    return res.status(200).json(data);
  },
  //New session
  newSession: async (req, res) => {
    const session = req.body;
    if (!session) {
      return response.send400(res, "Invalid session name.");
    }

    const existingSession = await Session.findOne({ name: session.name });
    if (existingSession) {
      return response.send400(
        res,
        "A session with the same name already exists.",
      );
    }

    const newSession = new Session({
      name: session.name,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      isCurrent: false,
    });
    await newSession.save();
    return res.status(200).json({ message: "New session created" });
  },

  getSessions: async (req, res) => {
    const sessions = await Session.find().lean();
    return res.status(200).json(sessions);
  },

  changeCurrentSession: async (req, res) => {
    const session = req.body;
    if (!session) {
      return response.send400(res, "No session provided.");
    }

    const [currentSession, classes] = await Promise.all([
      Session.findById(session._id),
      StudentClass.find({ currentLevel: { $ne: 0 } }),
    ]);
    if (!currentSession) {
      return response.send400(res, "Session not found.");
    }

    currentSession.isCurrent = true;
    await currentSession.save();

    const promises = classes.map((studentClass) => {
      const { className } = studentClass;
      const enrolmentYear = parseInt(className.split("-")[0]);
      const sessionEndYear = parseInt(currentSession.name.split("-")[1]);
      const updatedLevel = (sessionEndYear - enrolmentYear) * 100;
      studentClass.currentLevel = updatedLevel;
      return studentClass.save();
    });

    await Promise.all(promises);
    return res.status(200).json({ message: "Current session updated" });
  },

  changeCurrentSemester: async (req, res) => {
    const semester = req.body;
    if (!semester) {
      return response.send400(res, "No semester provided.");
    }

    const currentSemester = await Semester.findOne({ name: semester.name });

    if (!currentSemester) {
      return response.send400(res, "Semester not found.");
    }

    currentSemester.isCurrent = true;
    await currentSemester.save();

    return res.status(200).json({ message: "Current semester updated" });
  },

  updateCourseRegistration: async (req, res) => {
    const updates = req.body;
    if (!updates) {
      return response.send400(res, "No data provided");
    }

    await CourseRegStatus.updateOne(
      { name: "courseRegistrationStatus" },
      { $set: updates },
    );
    return res
      .status(200)
      .json({ message: "Course registration details updated" });
  },

  getProfile: async (req, res) => {
    const id = req.user._id;
    const isValid = mongoose.Types.ObjectId.isValid(id)
    if (!id || !isValid)
      return response.send400(res, "The staff ID supplied is invalid.");

    const admin = await User.findById(id,
      { name: 1, username: 1, email: 1, phoneNumber: 1, sex: 1, address: 1, image: 1, title: 1 }
    ).lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "No admin with the given ID was found",
      });
    }
    return res.status(200).json(admin);
  }
};

module.exports = AdminController;
