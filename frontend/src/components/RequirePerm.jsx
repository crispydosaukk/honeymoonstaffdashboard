// frontend/src/components/RequirePerm.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { can, getSafePath } from "../utils/perm";
import { useAuth } from "../context/AuthContext";

export default function RequirePerm({ perm, children }) {
  const { userData, perms, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#071428] flex items-center justify-center text-white/50">
        <div className="w-8 h-8 border-2 border-[#D0B079] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!can(perm, userData, perms)) {
    return <Navigate to={getSafePath(userData, perms)} replace />;
  }
  return children;
}
