// src/contexts/CallContext.jsx
import { useEffect, useRef, useState } from "react";
import { CallContext } from "./CallContextContext";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import Peer from "simple-peer";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";


export function CallProvider({ children }) {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const peerRef = useRef(null);
  const currentUser = auth.currentUser;

  // Listen for incoming calls
  useEffect(() => {
    if (!currentUser) return;

    const callsQuery = query(
      collection(db, "calls"),
      where("calleeId", "==", currentUser.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(callsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const callData = change.doc.data();
          setIncomingCall({ id: change.doc.id, ...callData });
          toast(`${callData.callerName} is calling you!`, {
            icon: callData.type === "video" ? "📹" : "🎙️",
            duration: 10000,
          });
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  const startCall = async (calleeId, calleeName, type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });
      setLocalStream(stream);
      setCallType(type);
      setIsCallActive(true);

      const callId = uuidv4();
      const callData = {
        callId,
        callerId: currentUser.uid,
        callerName: currentUser.displayName,
        calleeId,
        calleeName,
        type,
        status: "pending",
        createdAt: new Date(),
      };

      await addDoc(collection(db, "calls"), callData);
      setActiveCall({ ...callData, id: callId });

      // Create peer connection
      const peer = new Peer({ initiator: true, stream, trickle: false });
      peerRef.current = peer;

      peer.on("signal", async (signal) => {
        await addDoc(collection(db, "signals"), {
          callId,
          signal,
          from: currentUser.uid,
          to: calleeId,
          type: "offer",
        });
      });

      peer.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        endCall();
      });

      // Listen for answer signals
      const signalsQuery = query(
        collection(db, "signals"),
        where("callId", "==", callId),
        where("type", "==", "answer")
      );

      const unsubscribe = onSnapshot(signalsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const signalData = change.doc.data();
            if (signalData.from === calleeId) {
              peer.signal(signalData.signal);
              unsubscribe();
            }
          }
        });
      });
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Could not access microphone/camera");
      setIsCallActive(false);
    }
  };

  const acceptCall = async (callId, callerId, type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });
      setLocalStream(stream);
      setCallType(type);
      setIsCallActive(true);

      const callDoc = doc(db, "calls", callId);
      await updateDoc(callDoc, { status: "active" });

      const peer = new Peer({ initiator: false, stream, trickle: false });
      peerRef.current = peer;

      peer.on("signal", async (signal) => {
        await addDoc(collection(db, "signals"), {
          callId,
          signal,
          from: currentUser.uid,
          to: callerId,
          type: "answer",
        });
      });

      peer.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        endCall();
      });

      // Listen for offer signals
      const signalsQuery = query(
        collection(db, "signals"),
        where("callId", "==", callId),
        where("type", "==", "offer")
      );

      const unsubscribe = onSnapshot(signalsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const signalData = change.doc.data();
            if (signalData.from === callerId) {
              peer.signal(signalData.signal);
              unsubscribe();
            }
          }
        });
      });

      setIncomingCall(null);
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Could not access camera/microphone");
    }
  };

  const rejectCall = async (callId) => {
    const callDoc = doc(db, "calls", callId);
    await updateDoc(callDoc, { status: "rejected" });
    setIncomingCall(null);
  };

  const endCall = async () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setIsCallActive(false);
    setActiveCall(null);
    setCallType(null);
  };

  const value = {
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    isCallActive,
    callType,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
