// src/components/Chat/MessageInput.jsx
import { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { FiSmile, FiImage, FiVideo, FiMic, FiSend } from "react-icons/fi";
import { uploadToCloudinary, uploadAudioToCloudinary } from "../../cloudinary";
import toast from "react-hot-toast";

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({ text: message, mediaUrl: null, mediaType: null });
      setMessage("");
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    setUploading(true);
    try {
      let url;
      if (type === "audio") {
        url = await uploadAudioToCloudinary(file);
      } else {
        url = await uploadToCloudinary(file);
      }
      onSendMessage({ text: "", mediaUrl: url, mediaType: type });
      toast.success(`${type} shared successfully!`);
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = (type) => {
    if (type === "image") fileInputRef.current?.click();
    else if (type === "video") videoInputRef.current?.click();
    else if (type === "audio") audioInputRef.current?.click();
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Add emoji"
          >
            <FiSmile size={22} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => triggerFileInput("image")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Share image"
          >
            <FiImage size={22} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => triggerFileInput("video")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Share video"
          >
            <FiVideo size={22} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => triggerFileInput("audio")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Share audio"
          >
            <FiMic size={22} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder={uploading ? "Uploading media..." : "Type a message..."}
          disabled={uploading}
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() && !uploading}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50"
          title="Send message"
        >
          <FiSend size={20} />
        </button>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files[0], "image")}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files[0], "video")}
      />
      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files[0], "audio")}
      />
    </div>
  );
};

export default MessageInput;