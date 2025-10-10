import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import ProfilePage from "./Pages/ProfilePage";
import LoginPAge from "./Pages/LoginPAge";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../conext/AuthContext";

export const App = () => {
  const { authUser } = useContext(AuthContext);
  return (
    <div className="bg-[url('/bgImg.svg')] bg-cover">
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/Login" />}
        />
        <Route
          path="/Login"
          element={!authUser ? <LoginPAge /> : <Navigate to="/" />}
        />
        <Route
          path="/Profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/Login" />}
        />
      </Routes>
    </div>
  );
};
