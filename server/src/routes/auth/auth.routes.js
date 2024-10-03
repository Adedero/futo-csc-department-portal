require("dotenv").config();

const express = require("express");
const Router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../../models/actors/user.model");
const Token = require("../../models/objects/token.model");
const { sendTextEmail } = require("../../utils/mailer");
const randomInteger = require("../../utils/random-int");

Router.post("/sign-in", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({
    $or: [{ username: username }, { email: username }],
  });
  if (!user) {
    return res.status(401).json({
      success: false,
      info: "Invalid email",
      message: "Wrong or invalid username or email",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(403).json({
      success: false,
      info: "Forbidden",
      message: "Incorrect password.",
    });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return res.status(200).json({
    info: "Success",
    message: "Sign in successful",
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      username: user.username,
      email: user.email || "",
      image: user.image || "",
      title: user.title || "",
    },
  });
});

//Registers  a personal account
Router.post("/register", async (req, res) => {
  const { user } = req.body;
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Registration failed. No registration details provided",
    });
  }

  const existingUser = await User.findOne(
    {
      $or: [
        { username: user.username },
        user.email && { email: user.email },
        user.phoneNumber && { phoneNumber: user.phoneNumber },
      ],
    },
    { username: 1 },
  ).lean();
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Your account already exists. Please sign in instead.",
    });
  }

  const hashedPassword = await bcrypt.hash(user.password, 10);

  const newUser = new User({
    ...user,
    password: hashedPassword,
  });

  await newUser.save();

  return res.status(200).json({
    success: true,
    message: "Your account was successfully created.",
    user: {
      id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      name: newUser.name,
      email: newUser.email || "",
      imageUrl: newUser.imageUrl || "",
      sex: newUser.sex || "",
      phoneNumber: newUser.phoneNumber || "",
    },
  });
});

Router.post("/verify-account/:otp", async (req, res) => {
  if (!req.user) {
    return res.status(400).json({
      success: false,
      info: "Not authorized",
      message: "Please sign in to continue",
    });
  }

  if (req.user.isVerified) {
    return res.status(400).json({
      success: false,
      info: "Account already verified",
      message:
        "Your account has already been verified. Please sign in to continue.",
    });
  }

  const { otp } = req.params;
  if (!otp) {
    return res.status(400).json({
      success: false,
      info: "Invalid request",
      message: "No OTP provided. Could not complete account verification",
    });
  }
  const existingOtp = await OTP.findOne({ user: req.user._id });
  if (!existingOtp) {
    return res.status(400).json({
      success: false,
      info: "Expired OTP",
      message:
        "The OTP provided is invalid or has expired. Please sign in to generate a new one.",
    });
  }

  const isOtpCorrect = otp == existingOtp.value;
  if (!isOtpCorrect) {
    return res.status(400).json({
      success: false,
      info: "Wrong OTP",
      message:
        "The OTP provided is incorrect. Please check your email address and try again.",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { isVerified: true } },
    { new: true },
  );
  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      info: "Account not found",
      message: "This account does not exist. It may have been deleted.",
    });
  }

  return res.status(200).json({
    success: true,
    info: "Verification complete",
    message: "Your account has been verified successfully.",
    user: {
      name: req.user.name,
      email: req.user.email,
    },
  });
});

//Confirms user authentication for various purposes
Router.get("/check-auth", (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      isAuthenticated: false,
      info: "Not authenticated.",
      message: "User is not authenticated.",
    });
  }
  return res.status(200).json({
    isAuthenticated: true,
    isVerified: req.user.isVerified,
    user: {
      name: req.user.name,
      email: req.user.email,
    },
  });
});

//Sends email for password recovery
Router.post("/send-password-recovery-email/:email", async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({
      success: false,
      info: "Invalid request",
      message: "No email provided. Could not send OTP",
    });
  }

  const user = await User.findOne({ email: email }, { email: 1 }).lean();
  if (!user) {
    return res.status(400).json({
      success: false,
      info: "Account not found",
      message: "No account with the supplied email address was found.",
    });
  }

  let id = user._id;
  let otp = await OTP.findOne({ user: id });
  if (!otp) {
    otp = await new OTP({
      user: id,
      value: randomInteger(100000, 999999),
    }).save();
  }
  const text = `Your secure OTP: ${otp.value}. Note that this password expires in 1 hour`;

  const [info, error] = await sendTextEmail(
    user.email,
    "Ofriend Account Validation",
    text,
  );
  if (error) {
    return res.status(500).json({
      success: false,
      info: "Server Error",
      message:
        "Could not send OTP to email. Please, check your network connection and try again.",
    });
  }

  return res.status(200).json({
    success: true,
    info: "OTP sent",
    message: "An OTP has been sent to your email.",
  });
});

//Verifies OTP and changes password
Router.put("/change-password", async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    return res.status(400).json({
      success: false,
      info: "Invalid request",
      message: "No email or OTP provided. Could not complete password recovery",
    });
  }
  const user = await User.findOne({ email: email }, { email: 1, password: 1 });
  if (!user) {
    return res.status(400).json({
      success: false,
      info: "Account not found",
      message: "No account with the supplied email address was found.",
    });
  }
  const existingOtp = await OTP.findOne({ user: user._id }).lean();
  if (!existingOtp) {
    return res.status(400).json({
      success: false,
      info: "Expired OTP",
      message: "The OTP provided is invalid or has expired. Please, try again.",
    });
  }

  const isOtpCorrect = otp == existingOtp.value;
  if (!isOtpCorrect) {
    return res.status(400).json({
      success: false,
      info: "Wrong OTP",
      message:
        "The OTP provided is incorrect. Please check your email address and try again.",
    });
  }

  await OTP.findByIdAndDelete(existingOtp._id);

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    info: "Password changed",
    message: "Your account has been recovered successfully.",
  });
});

module.exports = Router;
