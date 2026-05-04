import { useEffect, useRef } from 'react';

const AudioCall = ({ localStream, remoteStream, onEnd }) => {
  const remoteAudioRef = useRef(null);
  const localAudioRef = useRef(null);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localAudioRef.current && localStream) {
      localAudioRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="call-container audio-call">
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <audio ref={localAudioRef} autoPlay muted />
      <h2>Audio Call</h2>
      <button onClick={onEnd} className="end-call-btn">End Call</button>
    </div>
  );
};

export default AudioCall;