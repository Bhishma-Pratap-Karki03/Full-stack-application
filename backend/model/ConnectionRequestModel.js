const { mongoose } = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique connection requests between users
connectionRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

// Prevent users from sending requests to themselves
connectionRequestSchema.pre("save", function (next) {
  if (this.sender.toString() === this.receiver.toString()) {
    const error = new Error("Cannot send connection request to yourself");
    return next(error);
  }
  next();
});

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = ConnectionRequest;
