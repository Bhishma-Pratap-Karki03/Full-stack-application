import React from "react";
import ConnectionsList from "../components/Connections/ConnectionsList";
import PageTitle from "../components/PageTitle";

const ConnectionsPage: React.FC = () => {
  return (
    <div className="page-container">
      <PageTitle title="My Connections" />
      <ConnectionsList />
    </div>
  );
};

export default ConnectionsPage;
