const express = require("express");
const { validateTokenMiddleware } = require("../middleware/AuthMiddleware");
const { adminOnlyMiddleware } = require("../middleware/RoleMiddleware");
const {
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
} = require("../controller/adminContactController");

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(validateTokenMiddleware);
router.use(adminOnlyMiddleware);

// Get all contact submissions
router.get("/", getAllContacts);

// Get contact statistics
router.get("/stats", getContactStats);

// Get a specific contact submission
router.get("/:id", getContactById);

// Update contact status
router.patch("/:id/status", updateContactStatus);

// Delete a contact submission
router.delete("/:id", deleteContact);

module.exports = router;
