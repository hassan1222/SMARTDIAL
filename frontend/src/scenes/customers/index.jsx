import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, FormControl, InputLabel, Select, MenuItem, Button, TextField } from '@mui/material';
import Header from "../../components/Header";
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";

const StyledTableHead = styled(TableHead)`
  background-color: #3e4396;
  color: white;
`;

const StyledTableBody = styled(TableBody)`
  background-color: #1f2a40;
  color: white;
`;

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSidebar, setIsSidebar] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false);
  const [updatedCustomer, setUpdatedCustomer] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/loginemp'); return; }
    // Fetch data from MongoDB using Axios or any other HTTP library
    axios.get('http://localhost:8080/api/customers') // Replace with your API endpoint
      .then(response => {
        setCustomers(response.data);
        setFilteredCustomers(response.data);

        // Extract unique category values from customers
        const uniqueCategories = [...new Set(response.data.map(customer => customer.category))];
        setCategories(uniqueCategories);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);

    if (category === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => customer.category === category);
      setFilteredCustomers(filtered);
    }
  };

  const handleUpdate = (customerId) => {
    // Find the selected customer for updating
    const customerToUpdate = customers.find(customer => customer._id === customerId);
    setSelectedCustomer(customerToUpdate);
    setUpdatedCustomer({ ...customerToUpdate }); // Set the updatedCustomer state with the selected customer's values
    setIsUpdateFormVisible(true);
  };

  const handleDelete = (customerId) => {
    // Perform any necessary validations or confirmations before deleting the customer

    axios.delete(`http://localhost:8080/api/customers/${customerId}`)
      .then(response => {
        // Handle success response, such as updating the customers state or displaying a success message
        alert(`Customer with ID ${customerId} deleted successfully.`);

        // Remove the deleted customer from the state or refresh the customer data from the server
        // Update the `customers` state in your component accordingly

        // Refresh the page
        window.location.reload();
      })
      .catch(error => {
        // Handle error response, such as displaying an error message
        console.error(`Error deleting customer with ID ${customerId}.`, error);
      });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUpdatedCustomer(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpdateFormSubmit = (event) => {
    event.preventDefault();

    // Perform update API call with updatedCustomer data
    axios.put(`http://localhost:8080/api/customers/${selectedCustomer._id}`, updatedCustomer)
      .then(response => {
        // Handle success response, such as updating the customers state or displaying a success message
        alert(`Customer with ID ${selectedCustomer._id} updated successfully.`);

        // Update the customers state with the updated customer
        const updatedCustomers = customers.map(customer => {
          if (customer._id === selectedCustomer._id) {
            return { ...customer, ...updatedCustomer };
          }
          return customer;
        });

        setCustomers(updatedCustomers);

        // Hide the update form
        setIsUpdateFormVisible(false);

        // Refresh the page
        window.location.reload();
      })
      .catch(error => {
        // Handle error response, such as displaying an error message
        console.error(`Error updating customer with ID ${selectedCustomer._id}.`, error);
      });
  };


  return (
    <div className="app">
      <Sidebar isSidebar={isSidebar} />
      <main className="content">
        <Topbar setIsSidebar={setIsSidebar} />
        <Box m="20px">
          <Header title="CUSTOMER" subtitle="Create a Customer Profile" />
          <FormControl sx={{ marginBottom: 2, minWidth: 200 }}>
            <InputLabel id="category-select-label">Filter by Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
              color="primary"
            >
              <MenuItem value="">All</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Address 1</TableCell>
                  <TableCell>Address 2</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Options</TableCell>
                </TableRow>
              </StyledTableHead>
              <StyledTableBody>
                {filteredCustomers.map(customer => (
                  <TableRow key={customer._id}>
                    <TableCell>{customer.firstName}</TableCell>
                    <TableCell>{customer.lastName}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.contact}</TableCell>
                    <TableCell>{customer.address1}</TableCell>
                    <TableCell>{customer.address2}</TableCell>
                    <TableCell>{customer.category}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={() => handleUpdate(customer._id)}>Update</Button>
                      <Button variant="contained" color="secondary" onClick={() => handleDelete(customer._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </StyledTableBody>
            </Table>
          </TableContainer>
          {isUpdateFormVisible && (
            <Box mt={4}>
              <Header title="Update Customer" />
              <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: 400, margin: '0 auto' }}>
                <form onSubmit={handleUpdateFormSubmit}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={updatedCustomer.firstName || ''}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={updatedCustomer.lastName || ''}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={updatedCustomer.email || ''}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <TextField
                    label="Contact"
                    name="contact"
                    value={updatedCustomer.contact || ''}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <TextField
                    label="Address 1"
                    name="address1"
                    value={updatedCustomer.address1 || ''}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <TextField
                    label="Address 2"
                    name="address2"
                    value={updatedCustomer.address2 || ''}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <TextField
                    label="Category"
                    name="category"
                    value={updatedCustomer.category || ''}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>Update Customer</Button>
                </form>
              </Box>
            </Box>
          )}
        </Box>
      </main>
    </div>
  );
};

export default Customer;
