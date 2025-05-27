import React, { useEffect, useState, useRef } from 'react';
import { FiPhone, FiVideo } from 'react-icons/fi';
import { useCall } from '../../../socket/Callcontext';
import { useSocketContext } from '../../../socket/socket';
import { zustandStore } from '../../../zustand/zustand';
import { useCallStream } from '../../../socket/streamContext';
import Peer from 'simple-peer';
import { toast } from 'react-toastify';
import axios from 'axios';
import api, { BASE_URL } from '../../../util';

function CallingBody() {
  const { socket } = useSocketContext();
  const { incomingCall, setIncomingCall, setOnCall, callType, setCallType } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const {peer, setPeer ,localStream,setLocalStream,remoteStream,setRemoteStream } = useCallStream();

  const [isPicked, setIsPicked] = useState(false);

  const [callData, setCallData] = useState();
  const [callEnded, setCallEnded] = useState(false);

  useEffect(() => {
    if (!callType && !incomingCall?.callDetails?.type) return;
    if (!callType) setCallType(incomingCall?.callDetails?.type);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const receiveReturnSignal = ({signal, callType}) => {
      console.log("Receiving signal finally ", signal);
      peer.signal(signal); 
    };

    const onCallAccepted = async (acceptData) => {
      setIncomingCall(acceptData.data)
      setIsPicked(true);
    };

    const onCallRejected = () => {
      toast.warn('Call was rejected.');
      setOnCall(null);
      endCall();
    };

    const onCallEnded = () => {
      toast.info('Call ended.');
      setCallType(null);
      setCallEnded(true);
      setIncomingCall(null);
      setOnCall(false);
      setIsPicked(false)
      if (peer) {
        peer.destroy();
        setPeer(null)
      }
  
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null)
      }
  
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
        setRemoteStream(null)
      }
    };

    socket.on('finalSignal', receiveReturnSignal);
    socket.on('callAccepted', onCallAccepted);
    socket.on('callRejected', onCallRejected);
    socket.on('callEnd', onCallEnded);

    return () => {
      socket.off('finalSignal', receiveReturnSignal);
      socket.off('callAccepted', onCallAccepted);
      socket.off('callRejected', onCallRejected);
      socket.off('callEnd', onCallEnded);
    };
  }, [socket, incomingCall, callType]);


  const endCall = async () => {
    setCallType(null);
    setCallEnded(true);
    setIncomingCall(null);
    setOnCall(false);
    setIsPicked(false)

    if (peer) {
      peer.destroy();
      setPeer(null)
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null)
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null)
    }

    try {
      await api.put(`/api/v1/callEnd`, { incomingCall });
    } catch (error) {
      console.error('Error while ending call');
    }
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  if (!callType && !incomingCall?.callDetails?.type) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg w-[95%] max-w-5xl h-[80%] shadow-2xl p-4 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-1 justify-between items-center">
          {/* Local User */}
          <div className="w-1/2 h-full flex items-center justify-center bg-gray-100 rounded-l-lg">
            {callType === "audio" ? (
              <img
                src={callData?.callerDetails?.avatar?.url || incomingCall?.callerDetails?.avatar?.url}
                alt="Caller"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-l-lg" />
            )}
          </div>

          {/* Divider */}
          <div className="relative w-0.5 bg-gray-300 h-[60%] mx-2">
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
              {callType === "audio" ? (
                <FiPhone className="text-green-600 w-6 h-6" />
              ) : (
                <FiVideo className="text-blue-600 w-6 h-6" />
              )}
            </div>
          </div>

          {/* Remote User */}
          <div className="w-1/2 h-full flex items-center justify-center bg-gray-100 rounded-r-lg">
            {isPicked || incomingCall ? (
              callType === "audio" ? (
                <img
                  src={callData?.receiverDetails?.avatar?.url || incomingCall?.receiverDetails?.avatar?.url}
                  alt="Receiver"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover rounded-r-lg" />
              )
            ) : (
              <h1>Connecting...</h1>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6 p-4">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full" onClick={endCall}>
            End Call
          </button>
        </div>
      </div>
    </div>
  );
}

export default CallingBody;
