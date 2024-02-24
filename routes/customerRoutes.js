const express = require('express');
const router = express.Router();
const Customer = require('../model/customer'); // Assuming you have a Customer model

// Create a new customer
router.post('/customers', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.get('/customers', async (req, res) => {
    try {
        console.log('in node')
      const customers = await Customer.find();
      console.log('data',customers)
      res.send(customers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  router.delete('/customers/:id', (req, res) => {
    const customerId = req.params.id;
  
    // Find the customer by ID and delete it
    Customer.findByIdAndRemove(customerId)
      .then(() => {
        res.sendStatus(204); // Send a success status code if delete operation is successful
      })
      .catch(error => {
        console.error(error);
        res.sendStatus(500); // Send an error status code if delete operation encounters an error
      });
  });
  router.put('/customers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, contact, address1, address2, category } = req.body;
  
      // Validate the input data (you can add additional validation logic)
      if (!firstName || !lastName || !email || !contact || !address1 || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const customer = await Customer.findByIdAndUpdate(id, {
        firstName,
        lastName,
        email,
        contact,
        address1,
        address2,
        category
      }, { new: true });
  
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
  
      res.json(customer);
    } catch (error) {
      console.error('Failed to update customer:', error);
      res.status(500).json({ error: 'Failed to update customer' });
    }
  });
module.exports = router;