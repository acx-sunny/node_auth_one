import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";

dotenv.config();
const PORT = process.env.SERVER_PORT || 4000;
const mongoURL = process.env.DATABASE_MONGODB_URL;
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
