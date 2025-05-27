import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import {
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiPaperclip,
  FiSmile,
  FiFileText,
  FiSend
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import MessageBody from './MessageBody';
import { handleSubmit } from '../../../action/messageAction';
import { useSocketContext } from '../../../socket/socket';
import { zustandStore } from '../../../zustand/zustand';
import AddImage from './AddImage';
import CallingBody from '../calling/CallingBody';
import { useCall } from '../../../socket/Callcontext';
import { useCallStream } from '../../../socket/streamContext';
import Peer from 'simple-peer'
import { useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '../../../util';
function MessageSkeleton({ userId, userAvatar, userName }) {
  const { callType, setCallType } = useCall();
  const [loading, setLoading] = useState(false);
  const { setStream, setPeer, localStream, setLocalStream, remoteStream, setRemoteStream } = useCallStream();
  const [text, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState("Offline")
  const messages = zustandStore(state => state.messages);
  const setMessages = zustandStore(state => state.setMessages);
  const setSelectedConversation = zustandStore(state => state.setSelectedConversation);
  const selectedConversation = zustandStore(state => state.selectedConversation);
  const { onlineUsers, socket } = useSocketContext()
  const { setIncomingCall } = useCall();

  const navigate = useNavigate()
  useEffect(() => {
    setSelectedConversation(userId)

    if (onlineUsers.includes(userId))
      setOnlineStatus("Online")
    else
      setOnlineStatus("Offline")
  }, [socket, userId])

  const handleSend = async () => {
    console.log("inside handlesend")
    if (!text && !image) {
      toast.error("Enter something before sending...");
      return;
    }

    try {
      const res = await api.post(
        `/api/v1/send/${selectedConversation}`,
        { text, image },
      );
      const newMessage = res.data;
      // toast.success("Message sent");
      setMessages([...messages, newMessage]); // This will now trigger reactivity
      setInput('');
      setImage(null)
    } catch (error) {
      toast.error("Failed to send the message");
      console.error("Error:", error.message);
    }
  };


  const startCall = async ({ type }) => {
    return;
    try {
      
      setCallType(type)
      console.log("your call type is : ", type)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType !== 'audio',
        audio: true,
      });
      setLocalStream(stream);
      setStream(stream);

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
      });

      peer.on('signal', (data) => {
        socket.emit('sendSignal', {
          to: selectedConversation,
          signal: data,
          callType: callType,
        });
      });

      peer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream)
      });

      // setCurrentPeer(peer); // why do we need this again ? shall i remote this since we are already settning setPeer(peer) don't you think its redundant ? 
      setPeer(peer);

      const callStarted = await api.post(`/api/v1/callStart/${selectedConversation}`, { callType: type });
      console.log("Call started", callStarted?.data);
      setIncomingCall(callStarted?.data);
    } catch (error) {
      console.error(error);
      toast.error('Error starting call');
    }
  };

  return (
    <div className="flex flex-col h-[75vh] md:h-[87vh]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-gray-300">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${userId}`)}>
          <img
            className="w-10 h-10 rounded-full"
            src={userAvatar}
            alt="User"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{userName}</h3>
            <p className={`text-sm ${onlineStatus === 'Online' ? 'text-green-500' : 'text-red-500'}`}>{onlineStatus}</p>
          </div>
        </div>
        <div className="flex gap-4 text-xl text-gray-600">
          <FiPhone className="cursor-pointer opacity-20" onClick={() => startCall({ type: "audio" })} />
          <FiVideo className="cursor-pointer opacity-20" onClick={() => startCall({ type: "video" })} />
          <FiMoreVertical className="cursor-pointer opacity-20" />
        </div>
      </div>
      {callType && <CallingBody />}
      {/* Messages */}
      <div className="h-[100vh] overflow-y-auto w-[100%]">
        <MessageBody
          loading={loading}
          userAvatar={userAvatar}
          userName={userName}
        />
      </div>
      {/* Bottom Input Area */}
      {image && (
        <div className="mt-2">
          <img src={selectedImage} alt="preview" className="max-w-xs rounded" />
        </div>
      )}
      <div className="flex items-center gap-8 p-4 border-t border-gray-300">
        {/* Input Field */}
        <div className="flex flex-1 bg-[#74D4FF] rounded-full items-center px-4 py-2">
          <input
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            value={text}
            type="text"
            placeholder="Type a message"
            className="flex-1 bg-transparent text-white placeholder-white outline-none"
          />
          <FiSend className="text-white text-xl cursor-pointer" onClick={handleSend} />
        </div>

        {/* Action Icons */}
        <FiPaperclip className="cursor-pointer text-gray-900 w-6 opacity-50" />
        <FiSmile className="text-gray-900 w-8 pointer-events-none opacity-50" />
        <FiFileText className="text-gray-900 w-8 pointer-events-none opacity-50" />
      </div>
    </div>

  );
}

export default MessageSkeleton;
