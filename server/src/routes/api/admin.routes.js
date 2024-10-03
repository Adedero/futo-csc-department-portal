const express = require("express");
const Router = express.Router();
const authenticate = require("../../middleware/authenticate");
const AdminController = require("../../controllers/admin.controller");
const {
  changeUserImage,
  resetLogin,
  courseRegistrationDetails,
  addStaffCourses,
  removeStaffCourses,
  getCourses,
  changePassword,
  changeUsername,
  updateProfile
} = require("../../controllers/controller");

//GENERAL
//Dashboard information.
Router.get(
  "/dashboard-info",
  authenticate.admin,
  AdminController.getDashboardInfo,
);

//Update profile
Router.get(
  "/profile",
  authenticate.admin,
  AdminController.getProfile
);

//Change image
//Change user image
Router.post("/change-user-image/:id", authenticate.admin, changeUserImage);

//Change password
Router.put("/change-password/:userId", authenticate.admin, changePassword);

//Change username
Router.put("/change-username/:userId", authenticate.admin, changeUsername);

//Update profile
Router.put(
  "/update-profile/:userId/:model",
  authenticate.admin,
  updateProfile
);



Router.get("/get-admins", authenticate.admin, AdminController.getAdmins);

Router.post("/add-admin", authenticate.admin, AdminController.addAdmin);

Router.delete("/remove-admin", authenticate.admin, AdminController.removeAdmin);

//Change user image
Router.post("/change-user-image/:id", authenticate.admin, changeUserImage);

//Reset login
Router.put("/reset-login/:userId/:model", authenticate.admin, resetLogin);

//Search actors
Router.get("/search-actors", authenticate.admin, AdminController.searchActors);

//STUDENT APIs
//Get all students
Router.get("/students", authenticate.admin, AdminController.getStudents);

//Get student profile
Router.get(
  "/student-profile/:id",
  authenticate.admin,
  AdminController.getStudentProfile,
);

//Change student name or reg Number
Router.put(
  "/change-name-or-reg-number/:userId/:studentId",
  authenticate.admin,
  AdminController.changeStudentNameOrRegNumber,
);

//Add student
Router.post("/add-student", authenticate.admin, AdminController.addStudent);

Router.get(
  "/get-course-reg-details",
  authenticate.admin,
  courseRegistrationDetails,
);

//STAFF APIs
//Get all staffs
Router.get("/staffs", authenticate.admin, AdminController.getStaffs);

Router.get(
  "/staff-profile/:id",
  authenticate.admin,
  AdminController.getStaffProfile,
);

//change staff name, staffId, rank or active status
Router.put(
  "/change-staff-details/:userId/:staffId",
  authenticate.admin,
  AdminController.changeStaffDetails,
);

Router.get("/all-staffs", authenticate.admin, AdminController.getAllStaffs);

//Add staff
Router.post("/add-staff", authenticate.admin, AdminController.addStaff);

//Add courses to staff courses
Router.put("/add-staff-courses/:staffId", authenticate.admin, addStaffCourses);

//Remove all staff courses
Router.put(
  "/remove-staff-courses/:staffId",
  authenticate.admin,
  removeStaffCourses,
);

//Get all advisors
Router.get("/advisors", authenticate.admin, AdminController.getAdvisors);

//COURSES API
//Get all courses
Router.get("/courses", authenticate.admin, getCourses);

//Create or edit course
Router.post("/manage-course", authenticate.admin, AdminController.manageCourse);

//Delete course
Router.delete(
  "/delete-course/:id",
  authenticate.admin,
  AdminController.deleteCourse,
);

//HOD and DEAN
Router.get("/hod-and-dean", authenticate.admin, AdminController.hodAndDean);

//Change H.O.D
Router.put("/change-hod", authenticate.admin, AdminController.changeHod);

//Add Dean
Router.post("/add-dean", authenticate.admin, AdminController.addDean);

//Change dean details
Router.put(
  "/change-dean-details",
  authenticate.admin,
  AdminController.changeDeanDetails,
);

//CLASSES API
//Get all classes
Router.get("/classes", authenticate.admin, AdminController.getClasses);

//Upload classlist to add students
Router.post(
  "/upload-class-list",
  authenticate.admin,
  AdminController.uploadClassList,
);

//Download classlist to add students
Router.get(
  "/download-class-list",
  authenticate.admin,
  AdminController.downloadClassList,
);

//Get students in a class
Router.get(
  "/class-students/:id",
  authenticate.admin,
  AdminController.getStudentsInClass,
);

//Create or edit class
Router.post("/manage-class", authenticate.admin, AdminController.manageClass);

//Delete course
Router.delete(
  "/delete-class/:id",
  authenticate.admin,
  AdminController.deleteClass,
);

//SETTINGS

Router.get("/get-settings", authenticate.admin, AdminController.getSettings);
//New session
Router.post("/new-session", authenticate.admin, AdminController.newSession);

//Get sessions
Router.get("/sessions", authenticate.admin, AdminController.getSessions);

//Change current session
Router.put(
  "/change-current-session",
  authenticate.admin,
  AdminController.changeCurrentSession,
);

//Change current semester
Router.put(
  "/change-current-semester",
  authenticate.admin,
  AdminController.changeCurrentSemester,
);

Router.put(
  "/update-course-registration",
  authenticate.admin,
  AdminController.updateCourseRegistration,
);
module.exports = Router;
