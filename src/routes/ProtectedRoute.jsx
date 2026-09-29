import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../services/authAPI";

const ProtectedRoute = () => {
  const location = useLocation();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem("token");

      // Token doesn't exist
      if (!token) {
        setIsAuthenticated(false);
        setCheckingAuth(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await getCurrentUser(token);

        if (response?.success) {
          // Keep latest user data
          if (response.user) {
            sessionStorage.setItem(
              "user",
              JSON.stringify(response.user)
            );
          }

          setIsAuthenticated(true);
        } else {
          throw new Error("Invalid token");
        }
      } catch (error) {
        console.error("Authentication verification failed:", error);

        // Token invalid / expired
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyToken();
  }, []);

  // While checking backend
  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Authenticated
  return <Outlet />;
};

export default ProtectedRoute;