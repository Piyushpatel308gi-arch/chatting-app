// src/components/Calls/IncomingCall.jsx
import { useCall } from "../../contexts/CallContext";
import { FiPhone, FiPhoneOff } from "react-icons/fi";

const IncomingCall = () => {
  const { incomingCall, acceptCall, rejectCall } = useCall();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-80 text-center animate-bounce">
        <div className="text-5xl mb-4">{incomingCall.type === "video" ? "📹" : "🎙️"}</div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          Incoming {incomingCall.type === "video" ? "Video" : "Audio"} Call
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          from {incomingCall.callerName}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => acceptCall(incomingCall.id, incomingCall.callerId, incomingCall.type)}
            className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition flex items-center gap-2"
          >
            <FiPhone size={18} /> Accept
          </button>
          <button
            onClick={() => rejectCall(incomingCall.id)}
            className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition flex items-center gap-2"
          >
            <FiPhoneOff size={18} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;