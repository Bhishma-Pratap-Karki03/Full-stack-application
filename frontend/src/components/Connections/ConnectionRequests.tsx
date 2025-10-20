import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ConnectionRequests.css";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
}

interface ConnectionRequest {
  _id: string;
  sender: User;
  receiver: User;
  status: "pending" | "accepted" | "rejected";
  message: string;
  createdAt: string;
}

const ConnectionRequests: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>(
    []
  );
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  useEffect(() => {
    fetchConnectionRequests();
  }, []);

  const fetchConnectionRequests = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [pendingResponse, sentResponse] = await Promise.all([
        axios.get("http://localhost:3000/api/connections/pending", { headers }),
        axios.get("http://localhost:3000/api/connections/sent", { headers }),
      ]);

      setPendingRequests(pendingResponse.data.requests);
      setSentRequests(sentResponse.data.requests);
    } catch (error) {
      console.error("Error fetching connection requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `http://localhost:3000/api/connections/accept/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from pending requests
      setPendingRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `http://localhost:3000/api/connections/reject/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from pending requests
      setPendingRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading connection requests...</div>;
  }

  return (
    <div className="connection-requests">
      <h2 style={{ color: "#4f46e5" }}>Connection Requests</h2>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          Received ({pendingRequests.length})
        </button>
        <button
          className={`tab ${activeTab === "sent" ? "active" : ""}`}
          onClick={() => setActiveTab("sent")}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "received" && (
          <div className="received-requests">
            {pendingRequests.length === 0 ? (
              <p className="no-requests">No pending connection requests</p>
            ) : (
              pendingRequests.map((request) => (
                <div key={request._id} className="request-card">
                  <div className="request-info">
                    <img
                      src={
                        request.sender.profilePicture
                          ? `http://localhost:3000/uploads/profile-pictures/${request.sender.profilePicture}`
                          : "/default-avatar.png"
                      }
                      alt={request.sender.name}
                      className="profile-picture"
                    />
                    <div className="request-details">
                      <h3>{request.sender.name}</h3>
                      <p className="email">{request.sender.email}</p>
                      {request.message && (
                        <p className="message">"{request.message}"</p>
                      )}
                      <p className="date">
                        Sent on{" "}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button
                      className="accept-btn"
                      onClick={() => handleAcceptRequest(request._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleRejectRequest(request._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "sent" && (
          <div className="sent-requests">
            {sentRequests.length === 0 ? (
              <p className="no-requests">No sent connection requests</p>
            ) : (
              sentRequests.map((request) => (
                <div key={request._id} className="request-card">
                  <div className="request-info">
                    <img
                      src={
                        request.receiver.profilePicture
                          ? `http://localhost:3000/uploads/profile-pictures/${request.receiver.profilePicture}`
                          : "/default-avatar.png"
                      }
                      alt={request.receiver.name}
                      className="profile-picture"
                    />
                    <div className="request-details">
                      <h3>{request.receiver.name}</h3>
                      <p className="email">{request.receiver.email}</p>
                      {request.message && (
                        <p className="message">"{request.message}"</p>
                      )}
                      <p className="date">
                        Sent on{" "}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      <span className={`status ${request.status}`}>
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionRequests;
