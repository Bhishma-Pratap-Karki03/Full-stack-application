import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  createdAt: string;
}

interface Conversation {
  otherUser: User;
  latestMessage: Message | null;
  unreadCount: number;
  conversationId: string;
}

const MessagesList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:3000/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return <div className="loading">Loading conversations...</div>;
  }

  return (
    <div className="instagram-messages-list">
      {conversations.length === 0 ? (
        <div className="no-conversations">
          <p>No conversations yet.</p>
          <p>Connect with professionals and start messaging!</p>
        </div>
      ) : (
        <div className="conversations-container">
          {conversations.map((conversation) => (
            <Link
              key={conversation.conversationId}
              to={`/messages/${conversation.otherUser._id}`}
              className="conversation-item"
            >
              <div className="conversation-avatar">
                <img
                  src={
                    conversation.otherUser.profilePicture
                      ? `http://localhost:3000/uploads/profile-pictures/${conversation.otherUser.profilePicture}`
                      : "/default-avatar.png"
                  }
                  alt={conversation.otherUser.name}
                  className="avatar-image"
                />
              </div>
              <div className="conversation-info">
                <div className="conversation-top">
                  <span className="user-name">{conversation.otherUser.name}</span>
                  {conversation.latestMessage && (
                    <span className="message-time">
                      {formatTime(conversation.latestMessage.createdAt)}
                    </span>
                  )}
                </div>
                <div className="conversation-bottom">
                  <span className={`latest-message ${conversation.unreadCount > 0 ? "unread" : ""}`}>
                    {conversation.latestMessage ? (
                      conversation.latestMessage.content.length > 35
                        ? `${conversation.latestMessage.content.substring(0, 35)}...`
                        : conversation.latestMessage.content
                    ) : (
                      "No messages yet"
                    )}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesList;
