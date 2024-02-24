import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";
import Side from "../global/Side";
import Topbar from "../global/Topbar";
import { useNavigate } from 'react-router-dom';



import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/system";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  TextField,
  Grid,
} from "@mui/material";

const StyledTableHead = styled(TableHead)`
  background-color: #3e4396;
  color: white;
`;

const StyledTableBody = styled(TableBody)`
  background-color: #1f2a40;
  color: white;
`;

const fetchEmployees = async (setEmployees) => {
  try {
    const response = await axios.get("http://localhost:8080/api/employee");
    setEmployees(response.data);
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};

const Employee = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isSide, setIsSide] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Track the selected employee
  const isNonMobile = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { navigate('/loginAdm'); return; }
    fetchEmployees(setEmployees);
  }, []);

  const handleUpdate = (employeeId) => {
    const employee = employees.find((employee) => employee._id === employeeId);
    setSelectedEmployee(employee); // Set the selected employee
  };

  const handleDelete = async (employeeId) => {
    try {
      await axios.delete(`http://localhost:8080/api/employee/${employeeId}`);
      const updatedEmployees = employees.filter(
        (employee) => employee._id !== employeeId
      );
      setEmployees(updatedEmployees);
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      // Send a PUT request to update the employee
      await axios.put(
        `http://localhost:8080/api/employee/${selectedEmployee._id}`,
        selectedEmployee
      );

      // Clear the selected employee and fetch updated data
      setSelectedEmployee(null);
      fetchEmployees(setEmployees);

      // Display alert
      window.alert("Employee updated successfully!");
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSelectedEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value,
    }));
  };

  return (
    <div className="app">
      <Side isSide={isSide} />
      <main className="content">
        <Topbar setIsSide={setIsSide} />
        <Box m="20px">
          <Header title="EMPLOYEE" subtitle="Employee's list" />

          <TableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Options</TableCell>
                </TableRow>
              </StyledTableHead>
              <StyledTableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>{employee.firstName}</TableCell>
                    <TableCell>{employee.lastName}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.contact}</TableCell>
                    <TableCell>{employee.salary}</TableCell>
                    <TableCell>{employee.address}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdate(employee._id)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDelete(employee._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </StyledTableBody>
            </Table>
          </TableContainer>

          {selectedEmployee && (
            <form onSubmit={handleFormSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={selectedEmployee.firstName || ""}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={selectedEmployee.lastName || ""}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    name="email"
                    value={selectedEmployee.email || ""}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Contact"
                    name="contact"
                    value={selectedEmployee.contact || ""}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Salary"
                    name="salary"
                    value={selectedEmployee.salary || ""}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Address"
                    name="address"
                    value={selectedEmployee.address || ""}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={selectedEmployee.password || ""}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Update Employee
              </Button>
            </form>
          )}
        </Box>
      </main>
    </div>
  );
};

export default Employee;