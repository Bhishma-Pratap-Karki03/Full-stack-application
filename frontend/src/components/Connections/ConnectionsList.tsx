import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import messengerIcon from "../../assets/images/messenger.png";
import axios from "axios";
import "../../styles/ConnectionsList.css";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
}

interface Connection {
  connectionId: string;
  user: User;
  connectedAt: string;
}

const ConnectionsList: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:3000/api/connections", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnections(response.data.connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading connections...</div>;
  }

  return (
    <div className="connections-list">
      <h2 style={{ color: '#4f46e5' }}>My Connections ({connections.length})</h2>
      
      {connections.length === 0 ? (
        <div className="no-connections">
          <p>You haven't connected with any professionals yet.</p>
          <p>Start by sending connection requests to other professionals!</p>
        </div>
      ) : (
        <div className="connections-grid">
          {connections.map((connection) => (
            <div key={connection.connectionId} className="connection-card">
              <img
                src={
                  connection.user.profilePicture
                    ? `http://localhost:3000/uploads/profile-pictures/${connection.user.profilePicture}`
                    : "/default-avatar.png"
                }
                alt={connection.user.name}
                className="profile-picture"
              />
              <div className="connection-info">
                <h3>{connection.user.name}</h3>
                <p className="email">{connection.user.email}</p>
                <p className="connected-date">
                  Connected on {new Date(connection.connectedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="connection-actions">
                <Link
                  to={`/profile/${connection.user._id}`}
                  className="view-profile-btn"
                >
                  View Profile
                </Link>
                <Link
                  to={`/messages/${connection.user._id}`}
                  className="message-btn"
                  title="Message"
                  aria-label={`Message ${connection.user.name}`}
                >
                  <img src={messengerIcon} alt="Message" className="message-icon" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionsList;
