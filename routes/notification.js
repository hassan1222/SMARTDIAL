const express = require("express");
const router = express.Router();
const Notification = require("../model/notification");

// GET all notifications
router.get("/notification", async (req, res) => {
  try {
    const notifications = await Notification.find().populate("sender", "name");
    res.json(notifications);
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST a new notification
router.post("/notification", async (req, res) => {

  try {
    const employee = new Notification(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.delete('/notification/:id', (req, res) => {
  const customerId = req.params.id;

  // Find the customer by ID and delete it
  Notification.findByIdAndRemove(customerId)
    .then(() => {
      res.sendStatus(204); // Send a success status code if delete operation is successful
    })
    .catch(error => {
      console.error(error);
      res.sendStatus(500); // Send an error status code if delete operation encounters an error
    });
});



module.exports = router;
