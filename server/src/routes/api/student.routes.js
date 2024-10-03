const express = require("express");
const Router = express.Router();
const authenticate = require("../../middleware/authenticate");
const {
  changeUserImage,
  changePassword,
  courseRegistrationDetails,
  changeUsername,
  updateProfile
} = require("../../controllers/controller");

const StudentController = require("../../controllers/student.controller");

Router.get(
  "/dashboard-info",
  authenticate.student,
  StudentController.getDashboardInfo,
);

//Get details for student course page
Router.get(
  "/course-reg-details",
  authenticate.student,
  StudentController.getCourseRegistrationStatus,
);

//Get courrses to register
Router.get(
  "/courses-to-register/:session/:semester/:level",
  authenticate.student,
  StudentController.getCourseToRegister,
);

//Get borrowed courses
Router.get(
  "/get-borrowed-courses",
  authenticate.student,
  StudentController.getCoursesToBorrow,
);

//Register courses
Router.post(
  "/register-courses",
  authenticate.student,
  StudentController.registerCourses,
);

//Course reg details
Router.get(
  "/get-course-reg-details",
  authenticate.student,
  courseRegistrationDetails,
);

//Get list of results
Router.get(
  "/results",
  authenticate.student,
  StudentController.getListOfResults,
);

//Get single result
Router.get(
  "/result/:id",
  authenticate.student,
  StudentController.getSingleResult,
);

//Get profile
Router.get(
  "/profile",
  authenticate.student,
  StudentController.getProfile
);

//Change image
//Change user image
Router.post("/change-user-image/:id", authenticate.student, changeUserImage);

//Change password
Router.put("/change-password/:userId", authenticate.student, changePassword);

//Change username
Router.put("/change-username/:userId", authenticate.student, changeUsername);

//Update profile
Router.put(
  "/update-profile/:userId/:model",
  authenticate.student,
  updateProfile
)


module.exports = Router;
