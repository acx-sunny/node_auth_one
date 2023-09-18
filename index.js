import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.SERVER_PORT || 4000;
const mongoURL = process.env.DATABASE_MONGODB_URL;
const secretKey = process.env.TOKEN_SECRET_KEY;
const secretRefreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

const secretKeyDuration1 = process.env.SECRET_TOKEN_DAY1;
const secretKeyDuration2 = process.env.SECRET_TOKEN_DAY2;

console.log(secretKeyDuration1, secretKeyDuration2);

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
                broswerVersion: {
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

app.post("/api/v1/auth/test", (req, res) => {
    res.send("This is the test route ");
});

app.post("/api/v1/auth/login", async (req, res) => {
    try {
        const {
            email,
            password,
            deviceIP,
            location: { latitude, longitude },
            deviceDetails: { os, osVersion, browser, browserVersion },
        } = req.body;

        // Find a user with the provided email
        const user = await userDB.findOne({ email });
        const firstname = user.firstname;
        const lastname = user.lastname;
        const role = user.role;

        console.log("FInd user than print name ", firstname, lastname);
        
        // If the user doesn't exist, return an error
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        // If the password doesn't match, return an error
        if (!passwordMatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        // Check if the user's role matches the provided role
        // if (user.role !== role) {
        //     return res.status(401).json({ error: "Role mismatch" });
        // }

        // Authentication successful, generate an access token
        const accessToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
            },
            secretKey, // Replace with your actual secret key
            { expiresIn: secretKeyDuration1 + "" }
        );

        // Generate refresh token during login
        const refreshToken = jwt.sign(
            {
                userId: user._id,
            },
            secretRefreshKey, // Ensure this matches the secret key used below
            { expiresIn: secretKeyDuration2 + "" }
        );

        // Find a user with the provided email in the sessionDB
        const sessionUser = await sessionDB.findOne({ email });

        if (!sessionUser) {
            // If the user doesn't exist in sessionDB, create a new session document
            const newSession = new sessionDB({
                email: user.email,
                sessionDetails: [
                    {
                        deviceIP,
                        location: {
                            latitude,
                            longitude,
                        },
                        deviceDetails: {
                            os,
                            osVersion,
                            browser,
                            browserVersion,
                        },
                    },
                ],
            });

            // Save the new session document
            await newSession.save();

            return res.status(200).json({
                message: "Login successful",
                username : firstname + " " + lastname,
                role : role,
                accessToken: accessToken,
                refreshToken: refreshToken,
            });
        }

        console.log(
            "Session details of the user exist, so pushing the new data to previous data"
        );

        // Add the new session details to the existing sessionDetails array
        sessionUser.sessionDetails.push({
            deviceIP,
            location: {
                latitude,
                longitude,
            },
            deviceDetails: {
                os,
                osVersion,
                browser,
                browserVersion,
            },
        });

        // Save the updated session document
        await sessionUser.save();

        return res.status(200).json({
            message: "Login successful",
            username : firstname + " " + lastname,
            role : role,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ error: "An internal server error occurred" });
    }
});

app.post("/api/v1/auth/register", async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            email,
            password,
            empID,
            gender,
            dob,
            role,
            profilePictureURL,
        } = req.body;

        // Check if the email is already registered
        const existingUser = await userDB.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user document using the userDB model
        const newUser = new userDB({
            firstname,
            lastname,
            email,
            password: hashPassword,
            empID,
            gender,
            dob,
            role,
            profilePictureURL,
        });

        // Save the user document to the database
        try {
            await newUser.save();
        } catch (error) {
            console.error(
                "Error while saving the user registration details to the DB:",
                error
            );
            return res.status(500).json({
                error: "An error occurred while saving user registration details",
            });
        }

        // Respond with a success message and user data
        const responseData = {
            message: "User registered successfully",
            userID: newUser._id,
        };
        return res.status(201).json(responseData);
    } catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({ error: "An internal server error occurred" });
    }
});

app.post("/api/v1/auth/refreshToken", (req, res) => {
    try {
        const { oldRefreshToken } = req.body;

        // Verify the refresh token using the refresh token secret key
        const decoded = jwt.verify(oldRefreshToken, secretRefreshKey); // Ensure this matches the secret key used above
        console.log(decoded);
        // Check if the refresh token is valid
        if (!decoded.userId) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        // Generate a new access token
        const accessToken = jwt.sign(
            {
                userId: decoded.userId,
                // Include any relevant user data here
            },
            secretKey, // Replace with your actual secret key
            { expiresIn: secretKeyDuration1 }
        );
        // Generate a new access token
        const refreshToken = jwt.sign(
            {
                userId: decoded.userId,
                // Include any relevant user data here
            },
            secretRefreshKey, // Replace with your actual secret key
            { expiresIn: secretKeyDuration2 }
        );

        // Respond with the new access token
        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ error: "Token renewal failed" });
    }
});

// Middleware to verify the access token
function verifyAccessToken(req, res, next) {
    const accessToken = req.header('Authorization');

    if (!accessToken) {
        return res.status(401).json({ error: 'Access token not provided' });
    }

    try {
        const decoded = jwt.verify(accessToken, secretKey); // Replace with your actual secret key
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid access token' });
    }
}

app.get('/api/v1/auth/protected', verifyAccessToken, (req, res) => {
    // The user is authenticated, you can access req.user to get user data
    const user = req.user;
    res.status(200).json({ message: 'Protected route', user });
});

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
