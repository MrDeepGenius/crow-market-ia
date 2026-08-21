import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import CreatorDashboard from "@/pages/CreatorDashboard";

// Routes an authenticated user to their role panel.
// Also persists a role chosen during Google register (?account_type=...),
// since Google OAuth skips the email-register step that normally saves it.
export default function DashboardRouter() {
  const { user } = useAuth();
  const [pendingType, setPendingType] = useState(null);

  const urlType = new URLSearchParams(window.location.search).get("account_type");

  useEffect(() => {
    if (urlType && user && user.account_type !== urlType) {
      base44.auth
        .updateMe({ account_type: urlType })
        .then(() => setPendingType(urlType))
        .catch(() => setPendingType(urlType));
    }
  }, [urlType, user]);

  const effectiveType = pendingType || user?.account_type;

  if (effectiveType === "viewer") {
    return <Navigate to="/marketplace" replace />;
  }
  return <CreatorDashboard />;
}