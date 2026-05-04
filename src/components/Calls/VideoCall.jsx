import React, { useEffect, useRef } from 'react';

const VideoCall = ({ localStream, remoteStream, onEnd }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="call-container">
      <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
      <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
      <button onClick={onEnd} className="end-call-btn">End Call</button>
    </div>
  );
};

export default VideoCall;