import React from "react";
import MessagesList from "../components/Messages/MessagesList";
import "../styles/MessagesPage.css";

const MessagesPage: React.FC = () => {
  return (
    <div className="messages-page">
      <div className="messages-layout">
        <div className="messages-sidebar">
          <div className="messages-header">
            <h2>Messages</h2>
          </div>
          <MessagesList />
        </div>
        <div className="messages-main">
          <div className="no-chat-selected">
            <div className="no-chat-icon">💬</div>
            <h3>Your messages</h3>
            <p>Send a message to start a chat.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
