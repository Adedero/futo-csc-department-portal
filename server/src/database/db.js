require("dotenv").config();
const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connection established");
  } catch (error) {
    console.error("Error establishing database connection", error);
  }
};

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Database connection closed due to app termination");
  process.exit(0);
});
