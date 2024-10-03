const express = require("express");
const Router = express.Router();
const authenticate = require("../../middleware/authenticate");
const {
  courseRegistrationDetails,
  sessionsAndCourses,
  getStaffProfile,
  changeUserImage,
  changePassword,
  changeUsername,
  updateProfile
} = require("../../controllers/controller");

const AdvisorController = require("../../controllers/advisor.controller");
const StaffController = require("../../controllers/staff.controller");

Router.get(
  "/dashboard-info",
  authenticate.advisor,
  AdvisorController.getDashboardInfo,
);

Router.get(
  "/profile",
  authenticate.advisor,
  getStaffProfile
);

//Change image
//Change user image
Router.post("/change-user-image/:id", authenticate.advisor, changeUserImage);

//Change password
Router.put("/change-password/:userId", authenticate.advisor, changePassword);

//Change username
Router.put("/change-username/:userId", authenticate.advisor, changeUsername);

//Update profile
Router.put(
  "/update-profile/:userId/:model",
  authenticate.advisor,
  updateProfile
)


Router.get(
  "/uploaded-results",
  authenticate.advisor,
  StaffController.getUploadedResults,
);

//Get registered students to add results
Router.get(
  "/get-registered-students",
  authenticate.advisor,
  StaffController.getRegisteredStudents,
);

//STUDENTS
//Get students in class
Router.get(
  "/class-students",
  authenticate.advisor,
  AdvisorController.getStudentsInClass,
);

//Get student profile
Router.get(
  "/student-profile/:id",
  authenticate.advisor,
  AdvisorController.getStudentProfile,
);

//Student course red details
Router.get(
  "/get-course-reg-details",
  authenticate.advisor,
  courseRegistrationDetails,
);

//Check if transcripts exist
Router.get(
  "/check-transcripts",
  authenticate.advisor,
  AdvisorController.checkStudentTranscripts,
);

//Generate transcipts
Router.get(
  "/generate-student-transcripts",
  authenticate.advisor,
  AdvisorController.generateStudentTranscripts,
);

//Get list of sessions and courses
Router.get("/sessions-and courses", authenticate.advisor, sessionsAndCourses);

//Add result
Router.post("/add-result", authenticate.advisor, StaffController.addResult);

//Get result for OGR
Router.get("/ogr-result", authenticate.advisor, StaffController.getOgrResult);

//Get result
Router.get(
  "/get-result-to-edit",
  authenticate.advisor,
  StaffController.getResultToEdit,
);

//Save edited result
Router.put(
  "/save-edited-result",
  authenticate.advisor,
  StaffController.saveEditedResult,
);

//SPECIFIC CLASS APIs
//Get registered students to add results
Router.get(
  "/get-registered-class-students",
  authenticate.advisor,
  AdvisorController.getRegisteredClassStudents,
);

//Get class result
Router.get(
  "/get-class-result-to-edit",
  authenticate.advisor,
  AdvisorController.getClassResultToEdit,
);

//Get result for OGR
Router.get(
  "/class-ogr-result",
  authenticate.advisor,
  AdvisorController.getClassOgrResult,
);

//View result all course
Router.get(
  "/class-result-all-courses",
  authenticate.advisor,
  AdvisorController.getClassResultAllCourses,
);

module.exports = Router;
