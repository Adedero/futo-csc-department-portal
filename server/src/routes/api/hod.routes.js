const express = require("express");
const Router = express.Router();
const authenticate = require("../../middleware/authenticate");
const HodController = require("../../controllers/hod.controller");
const {
  addStaffCourses,
  removeStaffCourses,
  getCourses,
  getStaffProfile,
  changeUserImage,
  changePassword,
  changeUsername,
  updateProfile
} = require("../../controllers/controller");

//GENERAL
//Dashboard information.
Router.get("/dashboard-info", authenticate.hod, HodController.getDashboardInfo);

Router.get(
  "/profile",
  authenticate.hod,
  getStaffProfile
);

//Change image
//Change user image
Router.post("/change-user-image/:id", authenticate.hod, changeUserImage);

//Change password
Router.put("/change-password/:userId", authenticate.hod, changePassword);

//Change username
Router.put("/change-username/:userId", authenticate.hod, changeUsername);


//Update profile
Router.put(
  "/update-profile/:userId/:model",
  authenticate.hod,
  updateProfile
);

//STAFF APIs
//Get all staffs
Router.get("/all-staffs", authenticate.hod, HodController.getAllStaffs);

Router.get(
  "/staff-profile/:id",
  authenticate.hod,
  HodController.getStaffProfile,
);

//Add staff
Router.post("/add-staff", authenticate.hod, HodController.addStaff);

//Add courses to staff courses
Router.put("/add-staff-courses/:staffId", authenticate.hod, addStaffCourses);

//Remove all staff courses
Router.put(
  "/remove-staff-courses/:staffId",
  authenticate.hod,
  removeStaffCourses,
);

//COURSES API
//Get all courses
Router.get("/courses", authenticate.hod, getCourses);

//Course allocation
Router.get(
  "/course-allocation",
  authenticate.hod,
  HodController.getCourseAllocation,
);

//Allocate course
Router.put("/allocate-course", authenticate.hod, HodController.allocateCourse);

//CLASSES
//Get all classes
Router.get("/classes", authenticate.hod, HodController.getClasses);

//Edit class
Router.post("/manage-class", authenticate.hod, HodController.manageClass);

//RESULTS APPROVAL AND DISAPPROVAL
Router.get(
  "/pending-results",
  authenticate.hod,
  HodController.getPendingResults,
);

//Get result for OGR
Router.get("/ogr-result", authenticate.hod, HodController.getOgrResult);

//Approve result
Router.put(
  "/approve-result/:id",
  authenticate.hod,
  HodController.approveResult,
);

//Approve result
Router.put(
  "/disapprove-result/:id",
  authenticate.hod,
  HodController.disapproveResult,
);

module.exports = Router;
