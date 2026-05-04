// src/components/Chat/Chat.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import Message from "./Message";
import MessageInput from "./MessageInput";
import SafeChatToggle from "../SafeChatToggle";
import CallPanel from "../Calls/CallPanel";
import { useCall } from "../../contexts/CallContext";
import { FiPhone, FiVideo, FiLogOut, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";

const Chat = () => {
  const { currentUser, logout } = useAuth();
  const { startCall, endCall, isCallActive } = useCall();
  const [messages, setMessages] = useState([]);
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUsers, setShowUsers] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const userList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.uid !== currentUser?.uid);
      setUsers(userList);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const sendMessage = async ({ text, mediaUrl, mediaType }) => {
    if (!text && !mediaUrl) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: text || "",
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
  };

  const initiateCall = (user, type) => {
    if (!user) return;
    startCall(user.uid, user.displayName, type);
    setShowUsers(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {currentUser?.displayName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{currentUser?.displayName}</p>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Logout"
            >
              <FiLogOut size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <SafeChatToggle onToggle={setIsSafeMode} initialValue={false} />
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <FiUsers size={18} />
              <span className="text-sm">Call User</span>
            </button>
          </div>
        </div>

        {showUsers && (
          <div className="flex-1 overflow-y-auto p-2">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">Online Users</h3>
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{user.displayName}</p>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => initiateCall(user, "audio")}
                    className="p-2 rounded-full bg-green-100 dark:bg-green-900 text-green-600 hover:bg-green-200 transition"
                    title="Audio call"
                  >
                    <FiPhone size={16} />
                  </button>
                  <button
                    onClick={() => initiateCall(user, "video")}
                    className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 hover:bg-blue-200 transition"
                    title="Video call"
                  >
                    <FiVideo size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showUsers && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
              <FiUsers size={40} className="mx-auto mb-2 opacity-50" />
              <p>Click "Call User" to start a call</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {isCallActive ? (
          <CallPanel />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg) => (
                <Message key={msg.id} message={msg} isSafeMode={isSafeMode} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <MessageInput onSendMessage={sendMessage} />
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;