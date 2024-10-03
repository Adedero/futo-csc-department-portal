const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["ADMIN", "ADVISOR", "STAFF", "STUDENT", "HOD", "DEAN"],
    index: true,
  },
  email: {
    type: String,
    index: true,
    unique: true,
    sparse: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  image: {
    type: String,
  },
  sex: {
    type: String,
    enum: ["MALE", "FEMALE", "OTHER"],
  },
  address: {
    type: String,
  },
});

UserSchema.set("timestamps", true);

UserSchema.pre("find", function (next) {
  this.sort({ name: 1 });
  next();
});

UserSchema.pre("save", async function (next) {
  if (this.role === "HOD") {
    try {
      // Update all other users to not be HOD
      await this.constructor.updateMany(
        { _id: { $ne: this._id }, role: "HOD" },
        { $set: { role: "STAFF" } },
      );
    } catch (err) {
      return next(err);
    }
  }
  next();
});
const User = mongoose.model("User", UserSchema);

module.exports = User;
