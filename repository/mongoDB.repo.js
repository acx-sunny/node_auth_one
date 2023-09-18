import mongoose from "mongoose";

// mongoose schema
const userRegisterSchemaModel = new mongoose.Schema({
  empID: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    // You can add email validation here using a regular expression
  },
  password: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    required: true,
  },
  profilePictureURL: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const userSessionSchemaModel = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  sessionDetails: [
    {
      deviceIP: {
        type: String,
      },
      location: {
        latitude: {
          type: String,
        },
        longitude: {
          type: String,
        },
      },
      deviceDetails: {
        os: {
          type: String,
        },
        osVersion: {
          type: String,
        },
        browser: {
          type: String,
        },
        browserVersion: {
          type: String,
        },
      },
      loginTime: {
        type: Date,
        default: Date.now,
        required: true,
      },
    },
  ],
});

const userDB = mongoose.model("user_registration_db", userRegisterSchemaModel);

const sessionDB = mongoose.model("user_session_db", userSessionSchemaModel);

export { userDB, sessionDB };
