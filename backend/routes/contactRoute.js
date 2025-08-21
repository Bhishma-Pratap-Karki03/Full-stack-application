const express = require("express");
const { createContact } = require("../controller/contactController");
const router = express.Router();

// Handle both /api/contact and /api/contact/submit
router.post(["/", "/submit"], createContact);

module.exports = router;
