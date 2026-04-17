const User = require("../models/User");
const bcrypt = require("bcryptjs");

// REGISTER
const registerUser = async (req, res) => {
  try {
    console.log("📥 REGISTER REQUEST BODY:", req.body);

    const { name, email, password, role } = req.body;

    // validate input
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    // check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // create user
    let userRole = "employee";
    if (role === "admin") userRole = "admin";
    else if (role === "manager") userRole = "manager";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole
    });

    console.log("✅ USER CREATED:", user._id);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.log("❌ REGISTER ERROR:", err);

    return res.status(500).json({
      message: "Server error during registration",
      error: err.message
    });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    console.log("📥 LOGIN REQUEST BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const jwt = require("jsonwebtoken");
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not set in environment");
    }
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.log("❌ LOGIN ERROR:", err);

    return res.status(500).json({
      message: "Server error during login",
      error: err.message
    });
  }
};

module.exports = { registerUser, loginUser };