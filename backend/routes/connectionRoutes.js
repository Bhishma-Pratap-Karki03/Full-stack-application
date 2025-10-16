const express = require("express");
const {
  sendConnectionRequest,
  getPendingRequests,
  getSentRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnections,
  checkConnection,
  getMutualConnections,
} = require("../controller/connectionController");
const { validateTokenMiddleware } = require("../middleware/AuthMiddleware");
const { professionalOnlyMiddleware } = require("../middleware/RoleMiddleware");

const router = express.Router();

// All routes require authentication and professional role
router.use(validateTokenMiddleware);
router.use(professionalOnlyMiddleware);

// Send connection request
router.post("/send", sendConnectionRequest);

// Get pending requests (received)
router.get("/pending", getPendingRequests);

// Get sent requests
router.get("/sent", getSentRequests);

// Accept connection request
router.put("/accept/:requestId", acceptConnectionRequest);

// Reject connection request
router.put("/reject/:requestId", rejectConnectionRequest);

// Get all connections
router.get("/", getConnections);

// Check connection status with another user
router.get("/check/:otherUserId", checkConnection);

// Get mutual connections with another user
router.get("/mutual/:userId", getMutualConnections);

module.exports = router;
