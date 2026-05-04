import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import NewChatModal from './NewChatModal';

const Sidebar = ({ onSelectChat, selectedChatId }) => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatList);
    });
    return unsub;
  }, [currentUser]);

  // Helper to get the other participant's email
  const getRecipientEmail = (chat) => {
    if (!chat.participantEmails) return chat.id;
    return chat.participantEmails.find(email => email !== currentUser.email) || 'Chat';
  };

  const handleChatCreated = (chatId) => {
    onSelectChat(chatId);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Chats</h3>
        <button onClick={() => setShowNewChat(true)}>+ New</button>
      </div>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={chat.id === selectedChatId ? 'active' : ''}
            onClick={() => onSelectChat(chat.id)}
          >
            {getRecipientEmail(chat)}
          </li>
        ))}
      </ul>
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onChatCreated={handleChatCreated}
        />
      )}
    </div>
  );
};

export default Sidebar;