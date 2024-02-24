const jwt = require("jsonwebtoken");
const Employee = require("../model/employee");

// Middleware for authorization
const authorize = (requiredRole) => {
  return async (req, res, next) => {
    // Get the token from the request headers
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the employee by ID from the token
      const employee = await Employee.findById(decoded.id);

      if (!employee) {
        return res.status(401).json({ error: "Invalid token" });
      }

      // Check if the employee has the required role
      if (employee.role !== requiredRole) {
        return res.status(403).json({ error: "Permission denied" });
      }

      // If everything is fine, set the employee on the request object
      req.employee = employee;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
};

module.exports = authorize;
