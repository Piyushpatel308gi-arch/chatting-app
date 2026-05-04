import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const NewChatModal = ({ onClose, onChatCreated }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setUsers([]);
      return;
    }
    const fetchUsers = async () => {
      setLoading(true);
      const q = query(
        collection(db, 'users'),
        where('email', '>=', searchTerm),
        where('email', '<=', searchTerm + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => doc.data())
        .filter(user => user.uid !== currentUser.uid);
      setUsers(results);
      setLoading(false);
    };
    fetchUsers();
  }, [searchTerm, currentUser.uid]);

  const startChat = async (otherUser) => {
    // Check if a chat already exists between these two
    const existing = await getDocs(
      query(
        collection(db, 'chats'),
        where('participants', 'array-contains', currentUser.uid)
      )
    );
    let alreadyExists = false;
    existing.docs.forEach(doc => {
      const data = doc.data();
      if (data.participants.includes(otherUser.uid)) {
        alreadyExists = doc.id;
      }
    });
    if (alreadyExists) {
      onChatCreated(alreadyExists);
      onClose();
      return;
    }

    // Create new chat
    const chatRef = await addDoc(collection(db, 'chats'), {
      participants: [currentUser.uid, otherUser.uid],
      participantEmails: [currentUser.email, otherUser.email],
      lastMessage: '',
      updatedAt: serverTimestamp(),
      safeMode: false,
    });
    onChatCreated(chatRef.id);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>New Chat</h3>
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
        {loading && <p>Searching...</p>}
        {!loading && users.length === 0 && searchTerm.length >= 2 && (
          <p>No users found</p>
        )}
        <ul>
          {users.map(user => (
            <li key={user.uid} onClick={() => startChat(user)}>
              {user.email}
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default NewChatModal;