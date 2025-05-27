import React, { useEffect, useRef, useState } from 'react';
import { useCall } from '../../../socket/Callcontext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPhone, FaVideo } from 'react-icons/fa';
import { useSocketContext } from '../../../socket/socket';
import { useCallStream } from '../../../socket/streamContext';
import Peer from 'simple-peer';
import api, { BASE_URL } from '../../../util';

function IncomingVoiceCall({pendingSignal, setPendingSignal}) {
  const { incomingCall, setIncomingCall, setOnCall } = useCall();
  const {
    setStream,
    setPeer,
    setLocalStream,
    setRemoteStream,
  } = useCallStream();

  const { socket } = useSocketContext();
  // const peerRef = useRef(null);

  if (!incomingCall) return null; // safety check


  const handleAccept = async () => {
    try {
      const callType = incomingCall?.callDetails?.type;
      await api.put(
        `/api/v1/callAccept`,
        { incomingCall },
      );
      console.log("inside incoming call and pendingSignal is : ",pendingSignal)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType !== 'audio',
        audio: true,
      });

      setLocalStream(stream);
      setStream(stream);

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream,
      });

      // peerRef.current = peer;
      setPeer(peer);
      peer.signal(pendingSignal) // responding back to the signal for handshake
      peer.on('signal', (answerSignal) => {
        socket.emit('returnSignal', {
          to: incomingCall?.callerDetails?._id,
          signal: answerSignal,
          callType: callType,
        });
      });

      peer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
      });

      // Notify backend that call was accepted
      
      setOnCall(true);
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Could not accept the call.");
      setOnCall(false);
    }
  };

  const handleReject = async () => {
    try {
      setPendingSignal(null);
      await api.put(
        `/api/v1/callReject`,
        { incomingCall },
      );
    } catch (error) {
      console.error("Error rejecting call:", error);
      toast.error("Failed to reject call.");
    } finally {
      // Cleanup
      // peerRef.current = null;
      setIncomingCall(null);
      setOnCall(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg w-[95%] max-w-5xl h-[80%] shadow-2xl p-6 flex flex-col justify-between items-center">

        {/* User Avatar */}
        <div className="flex flex-col items-center mt-6">
          <img
            src={incomingCall?.callerDetails?.avatar?.url}
            alt="Caller Avatar"
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <h2 className="text-2xl font-bold">
            {incomingCall?.callerDetails?.firstName || 'Unknown Caller'}
          </h2>
        </div>

        {/* Accept/Reject Buttons */}
        <div className="flex gap-6 mt-10">
          <button
            onClick={handleAccept}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl"
          >
            {incomingCall?.callDetails?.type === 'audio' ? (
              <FaPhone className="text-green-900 text-4xl" />
            ) : (
              <FaVideo className="text-blue-900 text-4xl" />
            )}
          </button>

          <button
            onClick={handleReject}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl"
          >
            {incomingCall?.callDetails?.type === 'audio' ? (
              <FaPhone className="text-red-900 text-4xl" />
            ) : (
              <FaVideo className="text-red-900 text-4xl" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingVoiceCall;
