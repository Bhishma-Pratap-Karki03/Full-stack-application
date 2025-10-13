const express = require("express");
const {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  getUnreadCount,
} = require("../controller/messageController");
const { validateTokenMiddleware } = require("../middleware/AuthMiddleware");
const { professionalOnlyMiddleware } = require("../middleware/RoleMiddleware");

const router = express.Router();

// All routes require authentication and professional role
router.use(validateTokenMiddleware);
router.use(professionalOnlyMiddleware);

// Send a message
router.post("/send", sendMessage);

// Get all conversations
router.get("/conversations", getConversations);

// Get conversation with specific user
router.get("/conversation/:otherUserId", getConversation);

// Mark messages as read
router.put("/read/:otherUserId", markAsRead);

// Get unread message count
router.get("/unread-count", getUnreadCount);

module.exports = router;
