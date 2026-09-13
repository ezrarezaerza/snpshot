import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";

const AdminRouteGuard = ({ children }) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("snpshot_admin_token");
    if (!token) {
      setIsAuthenticated(false);
      setChecking(false);
      return;
    }

    // Verify token validity with server
    fetch("/api/admin/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("snpshot_admin_token");
          localStorage.removeItem("snpshot_admin_user");
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        // In case of transient network issue, fallback to token existence if recently checked
        setIsAuthenticated(Boolean(token));
      })
      .finally(() => {
        setChecking(false);
      });
  }, [location.pathname]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#010030] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7226FF] to-[#F042FF] flex items-center justify-center text-white shadow-[0_8px_24px_rgba(114,38,255,0.4)]">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-xs font-mono font-bold tracking-widest text-[#F042FF] uppercase">
            STUDIO OS // ACCESS VERIFICATION
          </div>
          <div className="text-sm font-semibold text-white/70">
            Validating Administrator Session...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default AdminRouteGuard;
