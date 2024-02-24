const express = require("express");
const jwt = require("jsonwebtoken");
const Employee = require("../model/employee");
require("dotenv").config(); // Load environment variables
const authorize = require("../middleware/authMiddleware");

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the employee by email
    const employee = await Employee.findOne({ email });

    // Check if the employee exists and the password is correct
    if (!employee || employee.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a JWT token with the employee's ID
    const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET);

    // Return the token as a response
    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




module.exports = router;