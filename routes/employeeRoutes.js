const express = require('express');
const router = express.Router();
const Employee = require('../model/employee');

router.post('/employee', async (req, res) => {
    try {
      const employee = new Employee(req.body);
      await employee.save();
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  router.get("/employee", async (req, res) => {
    try {
      const employees = await Employee.find();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  router.get('/employee', async (req, res) => {
    try {
      const { firstName, lastName } = req.query;
  
      // Find the employee based on first name and last name
      const employee = employees.find(e => e.firstName === firstName && e.lastName === lastName);
  
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
  
      res.json(employee);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  router.delete('/employee/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Find the employee by ID and remove it
      const deletedEmployee = await Employee.findByIdAndRemove(id);
  
      if (!deletedEmployee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
  
      return res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      console.error('Error deleting employee:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  router.put("/employee/:id", async (req, res) => {
    const { id } = req.params; // Get the employee ID from the request parameters
    const updatedEmployeeData = req.body; // Get the updated employee data from the request body
  
    try {
      // Update the employee in your database or data source
      // Example code using Mongoose for MongoDB
      const updatedEmployee = await Employee.findByIdAndUpdate(id, updatedEmployeeData, {
        new: true, // Return the updated employee object
      });
  
      res.json(updatedEmployee); // Respond with the updated employee object
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ error: "Failed to update employee" });
    }
  });
  
module.exports = router;


