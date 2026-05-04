import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { decryptText } from '../../encryption';

const MessageList = ({ chatId, safeKey }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp'));
    const unsub = onSnapshot(q, (snapshot) => {
      let msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (safeKey) {
        msgs = msgs.map((msg) => {
          if (msg.encrypted && msg.text && msg.iv) {
            try {
              msg.text = decryptText(msg.text, safeKey, msg.iv);
            } catch {
              msg.text = '[Unable to decrypt]';
            }
          }
          return msg;
        });
      }
      setMessages(msgs);
    });
    return unsub;
  }, [chatId, safeKey]);

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`message ${msg.senderId === currentUser?.uid ? 'sent' : 'received'}`}
        >
          {msg.text && <p>{msg.text}</p>}
          {msg.mediaType === 'photo' && <img src={msg.mediaUrl} alt="shared" />}
          {msg.mediaType === 'video' && <video controls src={msg.mediaUrl} />}
          {msg.mediaType === 'audio' && <audio controls src={msg.mediaUrl} />}
        </div>
      ))}
    </div>
  );
};

export default MessageList;