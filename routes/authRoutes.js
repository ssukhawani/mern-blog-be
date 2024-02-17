const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const isAuthenticated = require("../middleware/authMiddleware");

// User Registration
router.post(
  "/register",
  [
    // Validate input fields
    body("username", "Username is required").notEmpty(),
    body("email", "Email is required").notEmpty(),
    body("password", "Password is required").notEmpty(),
    body("email", "Invalid email").isEmail(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if the email is already registered
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Check if the username is already registered
      const usernameExists = await User.findOne({
        username: req.body.username,
      });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const defaultProfilePicture =
        "https://media.graphassets.com/output=format:jpg/resize=height:100,fit:max/NfeDw1RYThOGrwoBjlkE";

      // Create a new user
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        profilePicture: req.body.profilePicture || defaultProfilePicture,
      });

      // Save the user to the database
      const savedUser = await user.save();
      res.json({
        userId: savedUser._id,
        message: "User registered successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// User Login
router.post(
  "/login",
  [
    // Validate input fields
    body("email", "Email is required").notEmpty(),
    body("password", "Password is required").notEmpty(),
    body("email", "Invalid email").isEmail(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if the email exists
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).json({ message: "Email not found" });
      }

      // Check if the password is correct
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Create and assign a token
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
      res.header("auth-token", token).json({ token, userId: user._id });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = router;

// Get Logged-In User Details
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    // Fetch the user details based on the user ID stored in the request
    // Exclude password from the response
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
