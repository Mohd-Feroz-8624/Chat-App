
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/chat-app-assets/assets";
import { useContext } from "react";
import { AuthContext } from "../../conext/AuthContext";
import { ChatContext } from "../../conext/ChatContext";

const SideBar = () => {
  const { logout, onlineUsers } = useContext(AuthContext);
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);
  const [input, setInput] = useState(false);
  const [search, setSearch] = useState("");
  const filteredUsers = search
    ? users.filter((user) =>
        user.fullName?.toLowerCase().includes(search.toLowerCase())
      )
    : users;
  const navigate = useNavigate();
  
  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div
      className="sidebar"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "30%",
        backgroundColor: "#f0f2f5",
        borderRight: "1px solid #e0e0e0",
      }}
    >
      {/* Header */}
      <div
        className="sidebar-header"
        style={{
          padding: "15px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="user-info" style={{ display: "flex", alignItems: "center" }}>
          <img
            src={assets.profile}
            alt="Profile"
            style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
          />
          <span style={{ fontWeight: "bold" }}>User Name</span>
        </div>
        <div className="icons" style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={() => setInput(!input)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            {input ? "✕" : "🔍"}
          </button>
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {input && (
        <div
          className="search-bar"
          style={{
            padding: "10px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              outline: "none",
            }}
          />
        </div>
      )}

      {/* User List */}
      <div
        className="user-list"
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {filteredUsers.map((user) => (
          <div
            key={user.uid}
            onClick={() => setSelectedUser(user)}
            style={{
              padding: "10px",
              borderBottom: "1px solid #e0e0e0",
              cursor: "pointer",
              backgroundColor:
                selectedUser?.uid === user.uid ? "#d1e7ff" : "transparent",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              className="user-avatar"
              style={{ position: "relative", marginRight: "10px" }}
            >
              <img
                src={user.avatar || assets.profile}
                alt="User Avatar"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                }}
              />
              {onlineUsers.includes(user.uid) && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "10px",
                    height: "10px",
                    backgroundColor: "green",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                ></div>
              )}
            </div>
            <div className="user-details">
              <div style={{ fontWeight: "bold" }}>{user.fullName}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {user.status || "Offline"}
              </div>
            </div>
            {unseenMessages[user.uid] > 0 && (
              <div
                style={{
                  marginLeft: "auto",
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                {unseenMessages[user.uid]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
