const ConnectionRequest = require("../model/ConnectionRequestModel");
const User = require("../model/userModel");

// Send a connection request
async function sendConnectionRequest(req, res) {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver ID is required",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        message: "Cannot send connection request to yourself",
      });
    }

    // Check if receiver exists and is a professional
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (receiver.role !== "professional") {
      return res.status(400).json({
        message: "Can only send connection requests to professionals",
      });
    }

    // Check if connection request already exists
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Connection request already exists between these users",
      });
    }

    const connectionRequest = new ConnectionRequest({
      sender: senderId,
      receiver: receiverId,
      message: message || "",
    });

    await connectionRequest.save();

    // Populate sender info for response
    await connectionRequest.populate("sender", "name email profilePicture");

    res.status(201).json({
      message: "Connection request sent successfully",
      connectionRequest,
    });
  } catch (error) {
    console.error("Error sending connection request:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Get pending connection requests (received)
async function getPendingRequests(req, res) {
  try {
    const userId = req.user.id;

    const pendingRequests = await ConnectionRequest.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Pending connection requests retrieved successfully",
      requests: pendingRequests,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Get sent connection requests
async function getSentRequests(req, res) {
  try {
    const userId = req.user.id;

    const sentRequests = await ConnectionRequest.find({
      sender: userId,
    })
      .populate("receiver", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Sent connection requests retrieved successfully",
      requests: sentRequests,
    });
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Accept connection request
async function acceptConnectionRequest(req, res) {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      receiver: userId,
      status: "pending",
    });

    if (!connectionRequest) {
      return res.status(404).json({
        message: "Connection request not found or already processed",
      });
    }

    connectionRequest.status = "accepted";
    await connectionRequest.save();

    await connectionRequest.populate("sender", "name email profilePicture");

    res.status(200).json({
      message: "Connection request accepted successfully",
      connectionRequest,
    });
  } catch (error) {
    console.error("Error accepting connection request:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Reject connection request
async function rejectConnectionRequest(req, res) {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      receiver: userId,
      status: "pending",
    });

    if (!connectionRequest) {
      return res.status(404).json({
        message: "Connection request not found or already processed",
      });
    }

    connectionRequest.status = "rejected";
    await connectionRequest.save();

    res.status(200).json({
      message: "Connection request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting connection request:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Get connected professionals (accepted connections)
async function getConnections(req, res) {
  try {
    const userId = req.user.id;

    const connections = await ConnectionRequest.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    })
      .populate("sender", "name email profilePicture")
      .populate("receiver", "name email profilePicture")
      .sort({ updatedAt: -1 });

    // Format connections to show the other user
    const formattedConnections = connections.map((conn) => {
      const otherUser = conn.sender._id.toString() === userId ? conn.receiver : conn.sender;
      return {
        connectionId: conn._id,
        user: otherUser,
        connectedAt: conn.updatedAt,
      };
    });

    res.status(200).json({
      message: "Connections retrieved successfully",
      connections: formattedConnections,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({
      message: "Error fetching connections"
    });
  }
}

// Check connection status between two users
async function checkConnection(req, res) {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    if (userId === otherUserId) {
      return res.status(200).json({
        connected: false,
        isPending: false,
        isReceiver: false,
        isSender: false,
        connection: null
      });
    }

    const connection = await ConnectionRequest.findOne({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    });

    if (!connection) {
      return res.status(200).json({
        connected: false,
        isPending: false,
        isReceiver: false,
        isSender: false,
        connection: null
      });
    }

    const isConnected = connection.status === 'accepted';
    const isPending = connection.status === 'pending';
    const isSender = connection.sender.toString() === userId;
    const isReceiver = connection.receiver.toString() === userId;

    res.status(200).json({
      connected: isConnected,
      isPending: isPending,
      isReceiver: isReceiver,
      isSender: isSender,
      connection: connection
    });
  } catch (error) {
    console.error("Error checking connection:", error);
    res.status(500).json({
      message: "Error checking connection status"
    });
  }
}

module.exports = {
  sendConnectionRequest,
  getPendingRequests,
  getSentRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnections,
  checkConnection,
};
