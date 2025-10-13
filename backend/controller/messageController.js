const Message = require("../model/MessageModel");
const ConnectionRequest = require("../model/ConnectionRequestModel");
const User = require("../model/userModel");

// Send a message
async function sendMessage(req, res) {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        message: "Receiver ID and content are required",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        message: "Cannot send message to yourself",
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    // Check if users are connected
    const connection = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId, status: "accepted" },
        { sender: receiverId, receiver: senderId, status: "accepted" },
      ],
    });

    if (!connection) {
      return res.status(403).json({
        message: "You can only send messages to connected professionals",
      });
    }

    const conversationId = Message.generateConversationId(senderId, receiverId);

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      conversationId,
    });

    await message.save();
    await message.populate("sender", "name profilePicture");

    res.status(201).json({
      message: "Message sent successfully",
      messageData: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Get conversation between two users
async function getConversation(req, res) {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if users are connected
    const connection = await ConnectionRequest.findOne({
      $or: [
        { sender: userId, receiver: otherUserId, status: "accepted" },
        { sender: otherUserId, receiver: userId, status: "accepted" },
      ],
    });

    if (!connection) {
      return res.status(403).json({
        message: "You can only view conversations with connected professionals",
      });
    }

    const conversationId = Message.generateConversationId(userId, otherUserId);
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Mark messages as read for the current user
    await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        isRead: false,
      },
      { isRead: true }
    );

    // Get other user info
    const otherUser = await User.findById(otherUserId).select("name email profilePicture");

    res.status(200).json({
      message: "Conversation retrieved successfully",
      conversation: {
        otherUser,
        messages: messages.reverse(), // Reverse to show oldest first
        hasMore: messages.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Get all conversations for a user
async function getConversations(req, res) {
  try {
    const userId = req.user.id;

    // Get all connections
    const connections = await ConnectionRequest.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    })
      .populate("sender", "name email profilePicture")
      .populate("receiver", "name email profilePicture");

    const conversations = [];

    for (const connection of connections) {
      const otherUser = connection.sender._id.toString() === userId ? connection.receiver : connection.sender;
      const conversationId = Message.generateConversationId(userId, otherUser._id);

      // Get latest message in conversation
      const latestMessage = await Message.findOne({ conversationId })
        .sort({ createdAt: -1 })
        .populate("sender", "name");

      // Get unread count
      const unreadCount = await Message.countDocuments({
        conversationId,
        receiver: userId,
        isRead: false,
      });

      conversations.push({
        otherUser,
        latestMessage,
        unreadCount,
        conversationId,
      });
    }

    // Sort by latest message time
    conversations.sort((a, b) => {
      const timeA = a.latestMessage ? new Date(a.latestMessage.createdAt) : new Date(0);
      const timeB = b.latestMessage ? new Date(b.latestMessage.createdAt) : new Date(0);
      return timeB - timeA;
    });

    res.status(200).json({
      message: "Conversations retrieved successfully",
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Mark messages as read
async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const conversationId = Message.generateConversationId(userId, otherUserId);

    await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Get unread message count
async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });

    res.status(200).json({
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  getUnreadCount,
};
