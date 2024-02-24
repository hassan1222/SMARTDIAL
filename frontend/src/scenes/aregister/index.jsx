import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

const AdminRegistration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Password validation
    const passwordErrors = {};
    if (newPassword.length < 8) {
      passwordErrors.length = "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(newPassword)) {
      passwordErrors.uppercase = "Password must contain at least one uppercase letter";
    }
    if (!/\d/.test(newPassword)) {
      passwordErrors.number = "Password must contain at least one number";
    }
    setErrors({ ...errors, password: passwordErrors });
  };

  const validateForm = () => {
    const newErrors = {};

    if (name.trim() === "") {
      newErrors.name = "Name is required";
    }

    if (email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Invalid email format";
    }

    if (password.trim() === "") {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    // Basic email validation regex
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await fetch("http://localhost:8080/api/admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
          // Registration successful
          console.log("Admin registered successfully");
          alert("Admin registered successfully");
          navigate("/loginAdm");
        } else {
          // Registration failed
          console.log("Admin registration failed");
        }
      } catch (error) {
        console.error("Error registering admin:", error);
      }
    }
  };

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
      <Typography variant="h1" component="h1" sx={{ marginBottom: "2rem" }}>
        Admin Registration
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "300px",
          padding: "2rem",
          borderRadius: "4px",
          backgroundColor: "#1f2a40",
        }}
      >
        <TextField
          label="Name"
          value={name}
          onChange={handleNameChange}
          variant="outlined"
          sx={{ marginBottom: "1rem", width: "100%" }}
        />
        {errors.name && <div style={{ color: "red" }}>{errors.name}</div>}
        <TextField
          label="Email"
          value={email}
          onChange={handleEmailChange}
          variant="outlined"
          sx={{ marginBottom: "1rem", width: "100%" }}
        />
        {errors.email && <div style={{ color: "red" }}>{errors.email}</div>}
        <TextField
          label="Password"
          value={password}
          onChange={handlePasswordChange}
          variant="outlined"
          type="password"
          sx={{ marginBottom: "1rem", width: "100%" }}
        />
        {errors.password && (
          <div style={{ color: "red" }}>
            {errors.password.length}
            {errors.password.uppercase}
            {errors.password.number}
          </div>
        )}
        <Button
          type="submit"
          variant="contained"
          sx={{ width: "100%", backgroundColor: "#4cceac", color: "white" }}
        >
          Register
        </Button>
      </Box>
    </Box>
  );
};

export default AdminRegistration;
