import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const ConnectDB = async () => {
  const MONGODB_URL = process.env.MONGODB_URL;

  return await mongoose
    .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((db) => {
      console.log(db);
      console.error(" MongoDB Connected!");
    })
    .catch((err) => {
      console.error("🚀 MongoDB Connection Error: ", { err });
    });
};

export default ConnectDB; // ConnectDB return promise, so use async/awaits
