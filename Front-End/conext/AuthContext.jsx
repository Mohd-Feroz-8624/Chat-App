import { createContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.baseURL = backendUrl;
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  //Check if user is authenticated and if so , set the user data and connect the socket

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data && data.success) {
        setAuthUser(data.user);
        conncetSocket(data.user);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      toast.error("Session expired. Please log in again.", error.message);
    }
  };

  //Login function to handle user authentication and socket connection
  const login = async (state, credentials) => {
    try {
      // `state` is expected to be the action string: 'login' or 'signup'
      const action = state;
      const { data } = await axios.post(`/api/auth/${action}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        conncetSocket(data.userData);
        // set both custom 'token' header and standard Authorization header
        axios.defaults.headers.common["token"] = data.token;
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changePassword = async (payload) => {
    try {
      const { data } = await axios.post("/api/auth/change-password", payload);
      if (data?.success) {
        toast.success(data.message || "Password updated successfully");
        return true;
      }
      toast.error(data?.message || "Failed to update password");
      return false;
    } catch (error) {
      toast.error(error.message || "Failed to update password");
      return false;
    }
  };

  // Logout function to handle user logout and socket disconnection
  const logout = async () => {
    localStorage.removeItem("token");
    setAuthUser(null);
    setToken(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully");
    if (socket && typeof socket.disconnect === "function") socket.disconnect();
  };

  // function to hanlde user profile update
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Error updating profile", error.message);
    }
  };

  //conncet socket function to handle socket connection and online users and update
  const conncetSocket = (userData) => {
    if (!userData || (socket && socket.connected)) return;
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };
  useEffect(() => {
    // ensure axios sends stored token before check
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      axios.defaults.headers.common["token"] = storedToken;
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      setToken(storedToken);
    }
    // Add axios interceptor to ensure every request carries the latest token
    const interceptor = axios.interceptors.request.use((config) => {
      const tokenNow = localStorage.getItem("token");
      if (tokenNow) {
        config.headers = config.headers || {};
        config.headers["token"] = tokenNow;
        config.headers["Authorization"] = `Bearer ${tokenNow}`;
      }
      return config;
    });

    checkAuth();

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);
  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    logout,
    login,
    changePassword,
    updateProfile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
