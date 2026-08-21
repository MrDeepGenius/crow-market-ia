import React from "react";
import { useAuth } from "@/lib/AuthContext";
import CreatorDashboard from "@/pages/CreatorDashboard";
import AffiliateDashboard from "@/pages/AffiliateDashboard";

export default function DashboardRouter() {
  const { user } = useAuth();
  const type = user?.account_type === "affiliate" ? "affiliate" : "creator";
  return type === "affiliate" ? <AffiliateDashboard /> : <CreatorDashboard />;
}