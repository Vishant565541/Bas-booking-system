const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid'); // Import UUID generator
const User = require("../models/person");
const protect = require('../middleware/authMiddleware'); // Adjust the path to your authMiddleware.js

require("dotenv").config();

const router = express.Router();

const loggedInUsers = new Set();

// Register User
router.post("/signup", async (req, res) => {
    console.log("signup");
    console.log(req.body);
    const { fname, lname, phone, email, password } = req.body;
    console.log(fname, lname, phone, email, password);
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fname, lname, phone, email, password: hashedPassword });

    await newUser.save();
    console.log("newUser", newUser);
    res.status(201).json({ message: "User registered successfully" });
});

// Login User
router.post("/login", async (req, res) => {
    console.log("login");
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log("login failed");
        return res.status(400).json({ message: "Invalid credentials" });
    } else {
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Use JWT_SECRET from env
        console.log("token", token);
        console.log("login success");

        // Generate UUID
        const uuid = uuidv4();
        console.log(uuid);

        // If you've added uuid to your User model, save it here:
        user.uuid = uuid;
        loggedInUsers.add(uuid);
        console.log("loggedInUsers", loggedInUsers);
        await user.save();

        res.json({
            token,
            user: {
                id: user._id,
                fname: user.fname, // Use fname and lname as in signup
                lname: user.lname,
                email: user.email,
                isAdmin: user.isAdmin,
            },
            uuid: uuid, // Include UUID in the response
        });
    }
});

//logout  user
router.post('/logout', (req, res) => {
    // Client-side should handle discarding the token
    // On the server-side, we can optionally remove the UUID from the loggedInUsers set
    const { uuid } = req.body;
    console.log("Logout request received for UUID:", uuid);
    console.log("Current loggedInUsers:", loggedInUsers);

    if (uuid && loggedInUsers.has(uuid)) {
        loggedInUsers.delete(uuid);
        console.log("UUID removed from loggedInUsers:", uuid);
        return res.status(200).json({ message: 'Logout successful' });
    } else if (uuid) {
        console.log("UUID not found in loggedInUsers:", uuid);
        return res.status(200).json({ message: 'Logout successful' }); // Even if not in the set, client is likely discarding the token
    } else {
        return res.status(400).json({ message: 'UUID is required' });
    }
});

router.get('/profile', protect, async (req, res) => {
    console.log("inside profile");
    console.log("Authenticated user payload:", req.user);

    try {
        const userId = req.user.id; // Assuming 'id' is the user identifier in your token
        const user = await User.findById(userId);
        console.log("user", user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            phone: user.phone,
        });

    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/viewall", async (req, res) => {
    try {
        console.log("inside viewall user");
        const users = await User.find(); // Fetch all users
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;