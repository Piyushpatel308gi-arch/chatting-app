// src/components/Calls/CallPanel.jsx
import { useCall } from "../../contexts/CallContext";
import { FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";

const CallPanel = () => {
  const { localStream, remoteStream, endCall, callType, isCallActive } = useCall();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === "video");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream && callType === "video") {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="flex-1 relative flex items-center justify-center p-4">
        {callType === "video" ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-4 right-4 w-32 h-24 rounded-lg border-2 border-white object-cover shadow-lg"
            />
          </>
        ) : (
          <div className="text-center text-white">
            <div className="w-32 h-32 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🎙️</span>
            </div>
            <p className="text-xl">Audio Call in Progress...</p>
          </div>
        )}
      </div>

      <div className="p-6 flex justify-center gap-6 bg-gray-800">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition ${
            isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          {isMuted ? <FiMicOff size={24} className="text-white" /> : <FiMic size={24} className="text-white" />}
        </button>

        {callType === "video" && (
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition ${
              !isVideoEnabled ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            {!isVideoEnabled ? <FiVideoOff size={24} className="text-white" /> : <FiVideo size={24} className="text-white" />}
          </button>
        )}

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition"
        >
          <FiPhoneOff size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default CallPanel;