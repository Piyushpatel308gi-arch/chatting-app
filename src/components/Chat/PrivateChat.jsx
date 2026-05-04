import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { FiSearch, FiArrowLeft, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

const PrivateChat = () => {
  const { currentUser } = useAuth();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateChatId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  useEffect(() => {
    if (!selectedUser) return;
    
    const id = generateChatId(currentUser.uid, selectedUser.uid);
    
    const q = query(collection(db, "chats", id, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    
    setTimeout(() => setChatId(id), 0);
    return unsubscribe;
  }, [selectedUser, currentUser]);

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }
    
    setLoading(true);
    try {
      const snapshot = await getDoc(doc(db, "users", searchEmail.trim()));
      
      if (snapshot.exists()) {
        const userData = snapshot.data();
        if (userData.uid === currentUser.uid) {
          toast.error("You can't chat with yourself");
        } else {
          setSearchResults([userData]);
        }
      } else {
        toast.error("User not found");
        setSearchResults([]);
      }
    } catch {
      toast.error("Error searching user");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async ({ text, mediaUrl, mediaType }) => {
    if (!text && !mediaUrl) return;
    if (!selectedUser || !chatId) return;
    
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: text || "",
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        receiverId: selectedUser.uid,
        timestamp: new Date(),
      });
    } catch {
      toast.error("Failed to send message");
    }
  };

  const startChat = (user) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchEmail("");
  };

  const backToSearch = () => {
    setSelectedUser(null);
    setMessages([]);
    setChatId(null);
  };

  if (selectedUser) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="bg-white border-b p-4 flex items-center gap-3">
          <button onClick={backToSearch} className="p-2 hover:bg-gray-100 rounded-full">
            <FiArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {selectedUser.displayName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{selectedUser.displayName}</p>
            <p className="text-sm text-gray-500">{selectedUser.email}</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} isSafeMode={false} />
          ))}
        </div>
        
        <MessageInput onSendMessage={sendMessage} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white border-b p-4">
        <h2 className="text-xl font-bold mb-4">Private Chat</h2>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchUser()}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchUser}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <FiSearch size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {searchResults.map((user) => (
          <div
            key={user.uid}
            onClick={() => startChat(user)}
            className="bg-white p-4 rounded-lg mb-2 cursor-pointer hover:bg-gray-50 flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
              <FiUser size={24} />
            </div>
            <div>
              <p className="font-semibold">{user.displayName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        ))}
        
        {searchResults.length === 0 && searchEmail && (
          <div className="text-center text-gray-500 mt-8">
            <FiUser size={48} className="mx-auto mb-2 opacity-50" />
            <p>No users found. Try searching with a registered email.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateChat;
