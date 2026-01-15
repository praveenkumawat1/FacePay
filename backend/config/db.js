const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Atlas Connected Successfully!`);
    console.log(` Database Host: ${conn.connection.host}`);
    console.log(` Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(" MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log(" Mongoose connected to MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log(" Mongoose disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log(" MongoDB connection closed");
  process.exit(0);
});

module.exports = connectDB;
