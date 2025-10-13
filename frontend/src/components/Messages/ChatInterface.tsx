import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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
  receiver: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  otherUser: User;
  messages: Message[];
  hasMore: boolean;
}

const ChatInterface: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    if (userId) {
      fetchConversation();
      getCurrentUserId();
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const getCurrentUserId = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  };

  const fetchConversation = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `http://localhost:3000/api/messages/conversation/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversation(response.data.conversation);
      
      // Mark messages as read
      await axios.put(
        `http://localhost:3000/api/messages/read/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "http://localhost:3000/api/messages/send",
        {
          receiverId: userId,
          content: newMessage.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add the new message to the conversation
      if (conversation) {
        setConversation(prev => ({
          ...prev!,
          messages: [...prev!.messages, response.data.messageData],
        }));
      }
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return <div className="loading">Loading conversation...</div>;
  }

  if (!conversation) {
    return <div className="error">Conversation not found</div>;
  }

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  conversation.messages.forEach(message => {
    const dateKey = formatDate(message.createdAt);
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    groupedMessages[dateKey].push(message);
  });

  return (
    <div className="instagram-chat-interface">
      <div className="chat-header">
        <div className="header-user-info">
          <img
            src={
              conversation.otherUser.profilePicture
                ? `http://localhost:3000/uploads/profile-pictures/${conversation.otherUser.profilePicture}`
                : "/default-avatar.png"
            }
            alt={conversation.otherUser.name}
            className="header-avatar"
          />
          <div className="header-text">
            <h3>{conversation.otherUser.name}</h3>
          </div>
        </div>
      </div>

      <div className="chat-messages-container">
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date}>
            <div className="date-divider">
              <span>{date}</span>
            </div>
            {messages.map((message) => (
              <div
                key={message._id}
                className={`chat-message ${
                  message.sender._id === currentUserId ? "sent" : "received"
                }`}
              >
                <div className="message-bubble">
                  <span className="message-text">{message.content}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={sendMessage} className="chat-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="chat-input"
            disabled={sending}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={sending || !newMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
