const express = require("express");
const router = express.Router();
const Admin = require("../model/admin");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config(); // Load environment variables


// POST a new admin
router.post("/admin", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newAdmin = new Admin({
      name,
      email,
      password,
    });

    const savedAdmin = await newAdmin.save();
    res.json(savedAdmin);
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the employee by email
      const employee = await Admin.findOne({ email });
  
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
  
  router.get("/admin", async (req, res) => {
    try {
      const admin = await Admin.findOne({}, { email: 1, password: 1 });
  
      if (!admin) {
        return res.status(404).json({ error: "Admin credentials not found" });
      }
  
      res.json({ email: admin.email, password: admin.password });
    } catch (error) {
      console.error("Error fetching admin credentials:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
module.exports = router;
