import { useContext, useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUserState] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser } = useContext(AuthContext);

  //function to get all users for sidebar

  const getUsers = async () => {
    try {
      console.debug(
        "getUsers: axios.defaults.headers.common=",
        axios.defaults.headers.common
      );
      console.debug(
        "getUsers: localStorage token=",
        localStorage.getItem("token")
      );
      // backend mounts messages routes under /api/message (singular)
      const { data } = await axios.get("/api/message/users");
      if (data && data.success) {
        setUsers(data.users || []);
        // backend currently returns `unseenMesages` (typo) — accept both
        setUnseenMessages(data.unseenMessages || data.unseenMesages || {});
      }
    } catch (error) {
      console.error(
        "getUsers error:",
        error.response ? error.response.status : error.message,
        error.response ? error.response.data : null
      );
      toast.error(error.message || "Failed to fetch users");
    }
  };

  // helper to update messages with logging for debugging
  const updateMessages = (updater) => {
    try {
      setMessages((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        console.debug(
          "updateMessages: prevCount=",
          prev?.length,
          "nextCount=",
          next?.length
        );
        if ((next?.length || 0) < (prev?.length || 0)) {
          console.warn(
            "updateMessages: messages decreased — possible overwrite/clear",
            {
              prevCount: prev?.length,
              nextCount: next?.length,
              stack: new Error().stack,
            }
          );
        }
        return next;
      });
    } catch (err) {
      console.error("updateMessages error:", err);
      setMessages(updater);
    }
  };

  // function to get messages for selected users
  const getMessages = async (userId) => {
    try {
      console.debug("getMessages: fetching messages for userId=", userId);
      const { data } = await axios.get(`/api/message/${userId}`);
      console.debug(
        "getMessages: received data",
        data && data.messages && data.messages.length
      );
      if (data && data.success) {
        updateMessages(data.messages || []);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch messages");
    }
  };

  //function to send message to selected user

  const sendMessages = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/message/send/${selectedUser._id}`,
        messageData
      );
      if (data && data.success) {
        // backend returns the created message as `message` (not newMessage) — accept both
        const created = data.message || data.newMessage;
        updateMessages((prevMessages) => [...prevMessages, created]);
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    }
  };

  //function to subscribe to messages for selected user

  const subscribeToMessages = async () => {
    if (!socket) return;
    // ensure we don't attach multiple handlers
    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      console.debug("ChatContext: received newMessage via socket:", newMessage);
      // normalize ids to strings for reliable comparisons
      const senderId = newMessage.senderId
        ? newMessage.senderId.toString()
        : newMessage.senderId;
      const selectedId = selectedUser?._id
        ? selectedUser._id.toString()
        : selectedUser?._id;

      if (selectedUser && senderId === selectedId) {
        newMessage.seen = true;
        updateMessages((prevMessages) => [...prevMessages, newMessage]);
        // mark message as seen on server (use server's /api/message/mark/:id)
        axios.put(`/api/message/mark/${newMessage._id}`).catch(() => {});
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [senderId]: prevUnseenMessages[senderId]
            ? prevUnseenMessages[senderId] + 1
            : 1,
        }));
      }
    });
  };

  //function to unsubscribe from messages
  const unSubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };
  useEffect(() => {
    subscribeToMessages();
    return () => {
      unSubscribeFromMessages();
    };
  }, [socket, selectedUser]);

  // fetch users once authUser is available so token/headers are set
  useEffect(() => {
    if (authUser) {
      getUsers();
    }
  }, [authUser]);

  // Restore selected user from localStorage after users are loaded
  useEffect(() => {
    const storedId = localStorage.getItem("selectedUserId");
    if (storedId && users && users.length > 0) {
      const found = users.find((u) => u._id === storedId);
      if (found) {
        // set selected user without writing again to localStorage
        setSelectedUserState(found);
      }
    }
  }, [users]);

  // Clear selected user when authUser logs out
  useEffect(() => {
    if (!authUser) {
      setSelectedUserState(null);
      localStorage.removeItem("selectedUserId");
    }
  }, [authUser]);

  // fetch messages whenever selected user changes (including restore)
  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      getMessages(selectedUser._id);
    } else {
      // clear messages when no selected user
      updateMessages([]);
    }
  }, [selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    setUsers,
    setMessages,
    getMessages,
    sendMessages,
    // persist selection to localStorage when components set selected user
    setSelectedUser: (user) => {
      setSelectedUserState(user);
      if (user && user._id) {
        localStorage.setItem("selectedUserId", user._id);
      } else {
        localStorage.removeItem("selectedUserId");
      }
    },
    unseenMessages,
    setUnseenMessages,
  };
  return <ChatContext.Provider value={value}> {children}</ChatContext.Provider>;
};
