import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/auth.route.js";

import {PORT, mongoURL} from './common.shared.js';


const app = express();
app.use(cors());
app.use(express.json());

// working code
const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected !!!");
  } catch (error) {
    console.error("MongoDB error", error);
  }
};
connectToDatabase();

// auth route
app.use("/api/v1/auth", authRouter);

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
