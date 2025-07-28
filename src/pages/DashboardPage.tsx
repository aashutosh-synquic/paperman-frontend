import React from "react";
import { useAuth } from "../hooks/useAuth";
import Users from "./users";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome to the Dashboard, {user?.email}</h1>
      <br />
      <Users />
    </div>
  );
};

export default DashboardPage;
