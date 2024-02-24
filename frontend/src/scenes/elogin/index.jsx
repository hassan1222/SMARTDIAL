// Login.js
import React, { useState, useEffect } from 'react';
import { useFormik } from "formik";
import * as yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {useUser} from "../../userContext"

const Login = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const { loginUser} = useUser()
  
  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().required("Password is required"),
  });

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", values);
      const token = response.data.token;
      const userEmail = values.email; // Get the user's email from the form values
      const employeeData = await fetchEmployeeData(values.email); // Fetch employee data
  
      if (employeeData) {
        const { firstName, lastName } = employeeData;
        const emp_name = `${firstName} ${lastName}`;
        console.log("emp_name: ", emp_name);
        loginUser(emp_name);
        console.log("Navigating to /employeedashboard");
      navigate("/employeedashboard");
      } else {
        console.error('Employee data not found for email:', values.email);
        // Display an error message to the user
      }
  
      // Store the token in local storage or a state management solution of your choice
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Error during login:", error);
      // Display an error message to the user
    }
  };
  
  const fetchEmployeeData = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/employee/?email=${email}`);
      const filteredData = response.data.filter(employee => employee.email === email);
      
      if (filteredData.length > 0) {
        const { firstName, lastName } = filteredData[0];
        return Promise.resolve({ firstName, lastName });
      } else {
        return Promise.resolve(null);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      return Promise.reject(error);
    }
  };
  

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Typography variant="h1" component="h2" sx={{ marginBottom: "2rem" }}>
        Login
      </Typography>
      <Typography variant="h5" component="p1" sx={{ marginBottom: "2rem" }}>
        Employee must enter his email or password to login.
      </Typography>
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "350px",
          padding: "2rem",
          borderRadius: "4px",
          backgroundColor: "#1f2a40",
        }}
      >
        <TextField
          label="Email"
          id="email"
          type="email"
          name="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          variant="outlined"
          sx={{ marginBottom: "1rem", width: "100%" }}
        />
        {formik.touched.email && formik.errors.email && (
          <Typography variant="body2" sx={{ color: "error.main", marginBottom: "1rem" }}>
            {formik.errors.email}
          </Typography>
        )}
        <TextField
          label="Password"
          id="password"
          type="password"
          name="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          variant="outlined"
          sx={{ marginBottom: "1rem", width: "100%" }}
        />
        {formik.touched.password && formik.errors.password && (
          <Typography variant="body2" sx={{ color: "error.main", marginBottom: "1rem" }}>
            {formik.errors.password}
          </Typography>
        )}
        <Button type="submit" variant="contained" sx={{ width: "100%", backgroundColor: "#4cceac", color: "white" }}>
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
