import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { useCall } from '../../hooks/useCall';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { deriveSafeKey } from '../../encryption';

const ChatRoom = ({ chatId }) => {
  const { currentUser } = useAuth();
  const { startCall } = useCall();
  const [safeMode, setSafeMode] = useState(false);
  const [safeKey, setSafeKey] = useState(null);
  const [chatData, setChatData] = useState(null);

  useEffect(() => {
    if (!chatId) return;
    const fetchChat = async () => {
      const snap = await getDoc(doc(db, 'chats', chatId));
      if (snap.exists()) setChatData(snap.data());
    };
    fetchChat();
  }, [chatId]);

  const otherEmail = chatData?.participantEmails?.find(
    (email) => email !== currentUser?.email
  ) || 'Unknown';

  const toggleSafeMode = () => {
    if (safeMode) {
      setSafeMode(false);
      setSafeKey(null);
    } else {
      const pass = prompt('Enter a shared passphrase for safe chat:');
      if (pass) {
        setSafeKey(deriveSafeKey(chatId, pass));
        setSafeMode(true);
      }
    }
  };

  const handleStartCall = (isVideo) => {
    if (chatData) {
      const otherUid = chatData.participants.find((uid) => uid !== currentUser.uid);
      if (otherUid) startCall(otherUid, isVideo);
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3>{otherEmail}</h3>
        <div className="header-buttons">
          <button onClick={() => handleStartCall(false)}>📞 Audio</button>
          <button onClick={() => handleStartCall(true)}>📹 Video</button>
          <button
            onClick={toggleSafeMode}
            className={safeMode ? 'safe-on' : 'safe-off'}
          >
            {safeMode ? '🛡️ Safe ON' : '🛡️ Safe OFF'}
          </button>
        </div>
      </div>
      <MessageList chatId={chatId} safeKey={safeKey} />
      <MessageInput chatId={chatId} safeKey={safeKey} />
    </div>
  );
};

export default ChatRoom;