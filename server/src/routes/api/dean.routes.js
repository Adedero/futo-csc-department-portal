const express = require("express");
const Router = express.Router();
const authenticate = require("../../middleware/authenticate");
const DeanController = require("../../controllers/dean.controller");
const {
  changeUserImage,
  changePassword,
  changeUsername,
  updateProfile
} = require("../../controllers/controller");

//GENERAL
//Dashboard information.
Router.get(
  "/dashboard-info",
  authenticate.dean,
  DeanController.getDashboardInfo,
);

Router.get(
  "/profile",
  authenticate.dean,
  DeanController.getProfile
);

//Change image
//Change user image
Router.post("/change-user-image/:id", authenticate.dean, changeUserImage);

//Change password
Router.put("/change-password/:userId", authenticate.dean, changePassword);

//Change username
Router.put("/change-username/:userId", authenticate.dean, changeUsername);

//Update profile
Router.put(
  "/update-profile/:userId/:model",
  authenticate.dean,
  updateProfile
);


//RESULTS APPROVAL AND DISAPPROVAL
Router.get(
  "/pending-results",
  authenticate.dean,
  DeanController.getPendingResults,
);

//Get result for OGR
Router.get("/ogr-result", authenticate.dean, DeanController.getOgrResult);

//Approve result
Router.put(
  "/approve-result/:id",
  authenticate.dean,
  DeanController.approveResult,
);

//Approve result
Router.put(
  "/disapprove-result/:id",
  authenticate.dean,
  DeanController.disapproveResult,
);

module.exports = Router;
