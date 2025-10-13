import React from "react";
import ConnectionRequests from "../components/Connections/ConnectionRequests";
import PageTitle from "../components/PageTitle";

const ConnectionRequestsPage: React.FC = () => {
  return (
    <div className="page-container">
      <PageTitle title="Connection Requests" />
      <ConnectionRequests />
    </div>
  );
};

export default ConnectionRequestsPage;
