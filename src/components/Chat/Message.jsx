// src/components/Chat/Message.jsx
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const Message = ({ message, isSafeMode }) => {
  const { currentUser } = useAuth();
  const isOwn = message.senderId === currentUser?.uid;
  const [imageLoaded, setImageLoaded] = useState(false);

  const filterProfanity = (text) => {
    const badWords = ["fuck", "shit", "damn", "ass", "bitch", "crap", "darn"];
    let filtered = text;
    badWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      filtered = filtered.replace(regex, "****");
    });
    return filtered;
  };

  const displayText = isSafeMode && message.text ? filterProfanity(message.text) : message.text;

  const renderMedia = () => {
    if (!message.mediaUrl) return null;

    if (message.mediaType === "image") {
      return (
        <div className="mt-2">
          <img
            src={message.mediaUrl}
            alt="Shared"
            className={`max-w-[250px] max-h-[250px] rounded-lg object-cover cursor-pointer transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onClick={() => window.open(message.mediaUrl, "_blank")}
          />
          {!imageLoaded && (
            <div className="w-[250px] h-[150px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          )}
        </div>
      );
    }

    if (message.mediaType === "video") {
      return (
        <div className="mt-2">
          <video
            src={message.mediaUrl}
            controls
            className="max-w-[300px] max-h-[250px] rounded-lg"
            controlsList="nodownload"
          />
        </div>
      );
    }

    if (message.mediaType === "audio") {
      return (
        <div className="mt-2">
          <audio src={message.mediaUrl} controls className="w-[250px]" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none"
        }`}
      >
        {!isOwn && (
          <p className="text-xs font-semibold mb-1 text-blue-600 dark:text-blue-400">
            {message.senderName}
          </p>
        )}
        {message.text && <p className="break-words">{displayText}</p>}
        {renderMedia()}
        <p className="text-xs opacity-70 mt-1 text-right">
          {message.timestamp?.toDate?.().toLocaleTimeString() || new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default Message;