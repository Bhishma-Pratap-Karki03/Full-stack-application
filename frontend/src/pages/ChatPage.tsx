import React from "react";
import ChatInterface from "../components/Messages/ChatInterface";
import MessagesList from "../components/Messages/MessagesList";
import "../styles/MessagesPage.css";

const ChatPage: React.FC = () => {
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
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
