import React from 'react';

const CallNotification = ({ callId, callerName, onAccept, onReject, isVideo }) => (
  <div className="call-notification">
    <p>{callerName} is calling... ({isVideo ? 'Video' : 'Audio'})</p>
    <button onClick={() => onAccept(isVideo)}>Accept</button>
    <button onClick={onReject}>Reject</button>
  </div>
);

export default CallNotification;