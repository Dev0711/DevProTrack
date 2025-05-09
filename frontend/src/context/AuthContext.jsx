import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      console.log("Attempting login with:", { username, password });

      const response = await authAPI.login({ username, password });
      console.log("Login response:", response);

      const { token, ...userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setCurrentUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        console.error("Error response:", error.response);
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      await authAPI.register(userData);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";

      if (error.response && typeof error.response.data === "string") {
        errorMessage = error.response.data;
      }

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const connectGithub = async (githubUsername, githubToken) => {
    try {
      setLoading(true);
      const response = await authAPI.connectGithub({
        username: currentUser.username,
        githubUsername,
        githubToken,
      });

      // Update user with GitHub connection info
      const updatedUser = {
        ...currentUser,
        hasGithubToken: true,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || "Failed to connect GitHub account. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        connectGithub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
