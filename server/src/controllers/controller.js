const mongoose = require("mongoose");
const path = require("node:path");
const fs = require("node:fs");
const response = require("../utils/response");
const bcrypt = require("bcrypt");

const Student = require("../models/actors/student.model");
const User = require("../models/actors/user.model");
const Staff = require("../models/actors/staff.model");
const Dean = require("../models/actors/dean.model");

const RegisteredCourse = require("../models/objects/registered-course.model");
const Session = require("../models/objects/session.model");
const Course = require("../models/objects/course.model");

async function resetLogin(req, res) {
  const { userId, model } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return response.send400(res, "Invalid user ID provided");
  }

  if (!model) {
    return response.send400(res, "No model provided");
  }

  if (model === "student") {
    const [student, user] = await Promise.all([
      Student.findOne({ user: userId }, { regNumber: 1 }).lean(),
      User.findById(userId),
    ]);
    if (!student || !user) {
      return response.send400(res, "The requested student was not found");
    }

    if (!student.regNumber) {
      return response.send400(
        res,
        "No registration number found for the requested student",
      );
    }
    const hashedPassword = await bcrypt.hash(student.regNumber, 10);
    (user.username = student.regNumber), (user.password = hashedPassword);

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Student login reset successfully.",
    });
  }

  if (model === "staff") {
    const [staff, user] = await Promise.all([
      Staff.findOne({ user: userId }, { staffId: 1 }).lean(),
      User.findById(userId),
    ]);
    if (!staff || !user) {
      return response.send400(res, "The requested staff was not found");
    }

    if (!staff.staffId) {
      return response.send400(res, "No staff ID found for the requested staff");
    }
    const hashedPassword = await bcrypt.hash(staff.staffId, 10);
    (user.username = staff.staffId), (user.password = hashedPassword);

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Staff login reset successfully.",
    });
  }

  if (model === "dean") {
    const [dean, user] = await Promise.all([
      Dean.findOne({ user: userId }, { staffId: 1 }).lean(),
      User.findById(userId),
    ]);
    if (!dean || !user) {
      return response.send400(res, "No Dean account found");
    }

    if (!dean.staffId) {
      return response.send400(res, "No staff ID found for the Dean");
    }

    const hashedPassword = await bcrypt.hash(dean.staffId, 10);
    (user.username = dean.staffId), (user.password = hashedPassword);

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Dean login reset successfully.",
    });
  }
}

async function changeUserImage(req, res) {
  const { image } = req.files;
  const { id } = req.params;
  const { model } = req.body;

  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      info: "Bad request",
      message: "The ID supplied is invalid.",
    });
  }
  if (!image) {
    return res.status(400).json({
      success: false,
      info: "Bad request",
      message: "No image was uploaded.",
    });
  }

  if (!model) {
    return res.status(400).json({
      success: false,
      info: "Bad request",
      message: "No model supplied.",
    });
  }

  let user;

  if (model === "student") {
    const student = await Student.findById(id, { studentClass: 1, user: 1 })
      .populate("user", "_id")
      .populate("studentClass", "className");

    if (!student) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "No student with the given ID was found",
      });
    }

    const { className } = student.studentClass;
    const uploadDir = path.resolve("public/assets/students", className);
    //Make sure the directory exists;
    fs.mkdirSync(uploadDir, { recursive: true });

    const existingImage = fs
      .readdirSync(uploadDir)
      .find((file) => file.startsWith(id + "."));

    if (existingImage) {
      fs.unlinkSync(path.join(uploadDir, existingImage));
    }

    const ext = image.name.split(".").pop();
    const imageName = `${id}.${ext}`;
    const uploadPath = path.join(uploadDir, imageName);
    const url = `${req.protocol}://${req.get("host")}/images/students/${className}/${imageName}`;

    await Promise.all([
      image.mv(uploadPath),
      User.updateOne({ _id: student.user._id }, { $set: { image: url } }),
    ]);

    return res.status(200).json({ url: url });
  }

  if (model === "staff") {
    const staff = await Staff.findById(id, { user: 1 })
      .populate("user", "_id")
      .lean();

    if (!staff) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "No staff with the given ID was found",
      });
    }

    const uploadDir = path.resolve("public/assets/staffs");
    //Make sure the directory exists;
    fs.mkdirSync(uploadDir, { recursive: true });

    const existingImage = fs
      .readdirSync(uploadDir)
      .find((file) => file.startsWith(id + "."));

    if (existingImage) {
      fs.unlinkSync(path.join(uploadDir, existingImage));
    }

    const ext = image.name.split(".").pop();
    const imageName = `${id}.${ext}`;
    const uploadPath = path.join(uploadDir, imageName);
    const url = `${req.protocol}://${req.get("host")}/images/staffs/${imageName}`;

    await Promise.all([
      image.mv(uploadPath),
      User.updateOne({ _id: staff.user._id }, { $set: { image: url } }),
    ]);

    return res.status(200).json({ url: url });
  }

  if (model === "dean") {
    const dean = await Dean.findOne({}, { user: 1 })
      .populate("user", "_id")
      .lean();

    if (!dean) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "No Dean account was found in the database.",
      });
    }

    const uploadDir = path.resolve("public/assets/staffs");
    //Make sure the directory exists;
    fs.mkdirSync(uploadDir, { recursive: true });

    const existingImage = fs
      .readdirSync(uploadDir)
      .find((file) => file.startsWith(id + "."));

    if (existingImage) {
      fs.unlinkSync(path.join(uploadDir, existingImage));
    }

    const ext = image.name.split(".").pop();
    const imageName = `${id.toString()}.${ext}`;
    const uploadPath = path.join(uploadDir, imageName);
    const url = `${req.protocol}://${req.get("host")}/images/staffs/${imageName}`;

    await Promise.all([
      image.mv(uploadPath),
      User.updateOne({ _id: dean.user._id }, { $set: { image: url } }),
    ]);

    return res.status(200).json({ url: url });
  }

  if (model === "admin") {
    const admin = await User.findById(id).lean();

    if (!admin) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "No admin account was found in the database.",
      });
    }

    const uploadDir = path.resolve("public/assets/admins");
    //Make sure the directory exists;
    fs.mkdirSync(uploadDir, { recursive: true });

    const existingImage = fs
      .readdirSync(uploadDir)
      .find((file) => file.startsWith(id + "."));

    if (existingImage) {
      fs.unlinkSync(path.join(uploadDir, existingImage));
    }

    const ext = image.name.split(".").pop();
    const imageName = `${id.toString()}.${ext}`;
    const uploadPath = path.join(uploadDir, imageName);
    const url = `${req.protocol}://${req.get("host")}/images/admins/${imageName}`;

    await Promise.all([
      image.mv(uploadPath),
      User.updateOne({ _id: admin._id }, { $set: { image: url } }),
    ]);

    return res.status(200).json({ url: url });
  }

  return res.status(400).json({
    success: false,
    info: "Bad request",
    message: "Invalid request parameters",
  });
}

async function courseRegistrationDetails(req, res) {
  const { id } = req.query;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return response.send400(res, "Invalid course registration ID");
  }

  const record = await RegisteredCourse.findById(id).populate({
    path: "student",
    populate: {
      path: "user",
      select: "-role -password",
    },
  });

  if (!record) {
    return res
      .status(404)
      .json({
        info: "Not found",
        message: "Could not find details of registered courses",
      });
  }
  return res.status(200).json(record);
}

async function sessionsAndCourses(req, res) {
  const [sessions, courses] = await Promise.all([
    Session.find().lean(),
    Course.find({}, { code: 1, semester: 1, level: 1 }).lean(),
  ]);

  return res.status(200).json({ sessions, courses });
}

async function addStaffCourses(req, res) {
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
}

async function removeStaffCourses(req, res) {
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
}
//COURSES APIs
async function getCourses(req, res) {
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
}

async function getStaffProfile(req, res) {
  const id = req.user._id;
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!id || !isValid)
    return response.send400(res, "The staff ID supplied is invalid.");

  const staff = await Staff.findOne({ user: id }, { courses: 0 })
    .populate(
      "user",
      "name title username email phoneNumber sex address image",
    )
    .populate("studentClass", "className currentLevel")
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
    studentClass,
    isHOD,
    isAdvisor,
    specialization,
    qualification,
    rank,
    dateOfBirth,
    nationality,
    stateOfOrigin,
    isActive
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
    studentClass,
    isHOD,
    isAdvisor,
    specialization,
    qualification,
    rank,
    dateOfBirth,
    nationality,
    stateOfOrigin,
    isActive,
    userId: staff.user._id,
  };
  return res.status(200).json(staffData);
}

async function changePassword(req, res) {
  const { userId } = req.params;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return response.send400(res, 'Invalid user ID supplied');
  }
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmPassword) {
    return response.send400(res, 'No passwords supplied.');
  }
  const user = await User.findById(userId, { password: 1 });
  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    return response.send400(res, 'Old password incorrect.');
  }
  if (newPassword.length < 6) {
    return response.send400(res, 'Password must be 6 characters or more.');
  }

  if (newPassword.length > 30) {
    return response.send400(res, 'Password is too long.');
  }

  if (confirmPassword !== newPassword) {
    return response.send400(res, 'Passwords do not match.')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  return res.status(200).json({ message: 'Password changed. Redirecting...' });
}

async function changeUsername(req, res) {
  const { userId } = req.params;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return response.send400(res, 'Invalid user ID supplied');
  }
  const { username } = req.body;

  if (!username) return response.send400(res, 'No username supplied.');
  if (username.length < 6) return response.send400(res, 'Username must be 6 characters or more.');

  const existingUser = await User.find({ username: username }).lean();

  if (existingUser.length) return response.send400(res, 'Another user with this username already exists.');

  await User.updateOne({ _id: userId }, { $set: { username: username } });

  return res.status(200).json({ message: 'Username changed. Redirecting...' });
}

async function updateProfile(req, res) {
  const { userId, model } = req.params;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return response.send400(res, 'Invalid user ID provided.');
  if (!model) return response.send400(res, 'Invalid request parameters.');

  const updates = req.body;

  if (!updates || !Object.keys(updates).length) return response.send400(res, 'No profile updates provided.');

  const { name, title, email, phoneNumber, sex, address, ...otherUpdates } = updates;

  const { dateOfBirth, nationality, stateOfOrigin, qualification, specialization } = otherUpdates

  const userUpdates = { name, title, email, phoneNumber, sex, address };

  const modelUpdates = { dateOfBirth, nationality, stateOfOrigin, qualification, specialization }

  // Filter out null or undefined values in userUpdates
  for (const key in userUpdates) {
    if (userUpdates[key] === null || userUpdates[key] === undefined) {
      delete userUpdates[key];
    }
  }

  // Filter out null or undefined values in modelUpdates
  for (const key in modelUpdates) {
    if (modelUpdates[key] === null || modelUpdates[key] === undefined) {
      delete modelUpdates[key];
    }
  }

  const query = [];
  if (userUpdates.email) query.push({ email: userUpdates.email });
  if (userUpdates.phoneNumber) query.push({ phoneNumber: userUpdates.phoneNumber });

  if (query.length) {
    const existingUsers = await User.find({ _id: { $ne: userId }, $or: query });
    if (existingUsers.length) {
      return response.send400(res, 'A user with this email or phone number already exists.')
    }
  }

  const promises = [];
  const options = [
    { type: "student", model: Student },
    { type: "staff", model: Staff },
  ];

  const selectedUser = options.find(option => option.type === model);

  if (Object.keys(userUpdates).length) {
    promises.push(User.updateOne({ _id: userId }, { $set: userUpdates }));
  }

  if (Object.keys(modelUpdates).length && selectedUser) {
    promises.push(selectedUser.model.updateOne({ user: userId }, { $set: modelUpdates }));
  }

  await Promise.all(promises);

  return res.status(200).json({ message: 'Updates saved.' });
  
}

module.exports = {
  changeUserImage,
  resetLogin,
  courseRegistrationDetails,
  sessionsAndCourses,
  addStaffCourses,
  removeStaffCourses,
  getCourses,
  changePassword,
  changeUsername,
  updateProfile,
  getStaffProfile
};
