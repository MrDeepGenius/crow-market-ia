import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import CreatorDashboard from "@/pages/CreatorDashboard";
import AffiliateDashboard from "@/pages/AffiliateDashboard";

export default function DashboardRouter() {
  const { user } = useAuth();
  if (user?.account_type === "viewer") {
    return <Navigate to="/marketplace" replace />;
  }
  const type = user?.account_type === "affiliate" ? "affiliate" : "creator";
  return type === "affiliate" ? <AffiliateDashboard /> : <CreatorDashboard />;
}