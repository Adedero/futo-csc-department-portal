const express = require("express");
const Router = express.Router();
const authenticate = require("../../middleware/authenticate");
const {
  getStaffProfile,
  changeUserImage,
  changePassword,
  changeUsername,
  updateProfile
} = require("../../controllers/controller");

const StaffController = require("../../controllers/staff.controller");

Router.get(
  "/dashboard-info",
  authenticate.staff,
  StaffController.getDashboardInfo,
);

Router.get(
  "/profile",
  authenticate.staff,
  getStaffProfile
);


//Change image
//Change user image
Router.post("/change-user-image/:id", authenticate.staff, changeUserImage);

//Change password
Router.put("/change-password/:userId", authenticate.staff, changePassword);

//Change username
Router.put("/change-username/:userId", authenticate.staff, changeUsername);

//Update profile
Router.put(
  "/update-profile/:userId/:model",
  authenticate.staff,
  updateProfile
)


Router.get(
  "/uploaded-results",
  authenticate.staff,
  StaffController.getUploadedResults,
);

//Get registered students to add results
Router.get(
  "/get-registered-students",
  authenticate.staff,
  StaffController.getRegisteredStudents,
);

//Add result
Router.post("/add-result", authenticate.staff, StaffController.addResult);

//Get result for OGR
Router.get("/ogr-result", authenticate.staff, StaffController.getOgrResult);

//Get result
Router.get(
  "/get-result-to-edit",
  authenticate.staff,
  StaffController.getResultToEdit,
);

//Save edited result
Router.put(
  "/save-edited-result",
  authenticate.staff,
  StaffController.saveEditedResult,
);

module.exports = Router;
