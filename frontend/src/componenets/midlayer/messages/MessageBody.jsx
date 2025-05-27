import React, { useEffect, useRef, useState } from 'react';
import { extractTime } from './timehandler';
import { useSelector } from 'react-redux';
import { zustandStore } from '../../../zustand/zustand';
import { useSocketContext } from '../../../socket/socket';
import { toast } from 'react-toastify';
import axios from 'axios';
import ImageLoading from '../../../loading/ImageLoading';
import api, { BASE_URL } from '../../../util';
// import { newMessageSocketListner } from '../../../action/messageAction';

function MessageBody({userAvatar,  userName }) {
    const {socket} = useSocketContext();
    const {user,isAuthenticated} = useSelector((state)=>state.user);
    const[isLoading,setLoading] = useState(false);
    const {messages,setMessages} = zustandStore();
    const lastMessageRef = useRef(null);
const selectedConversation = zustandStore(state => state.selectedConversation);
useEffect(()=>{
  setLoading(true),
  setTimeout(()=>{
    setLoading(false);
  },500)
},[])
    useEffect(() => {
      if(!user || !isAuthenticated) return;
      const fetchMessages = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/api/v1/messages/${selectedConversation}`);
          const data = res?.data?.messages ?? [];
          setMessages(data);
        } catch (error) {
          console.error("Error fetching messages", error);
          toast.error("Error while fetching the conversation");
        } finally {
          setLoading(false);
        }
      };
      if (socket) {
        socket.on("newMessage", (newMessage) => {
          fetchMessages()
        });
  
      }
      if (selectedConversation) {
        fetchMessages();
      }
      // Cleanup the event listener on component unmount
      return () => socket.off("newMessage");
    }, [selectedConversation,socket]);
    useEffect(()=>{
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
      }
    },[messages])
  return (
    <>
    {isLoading ? <div className='h-[80vh] flex-1 justify-center items-center'> <ImageLoading/> </div> : (
      
    <div className="flex-1 p-4 space-y-4">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;

        const chatCorner = message.receiver !== selectedConversation ? "chat-start" : "chat-end";
        const name = message.receiver !== selectedConversation ? userName : user?.firstName;
        const time = extractTime({ time: message.createdAt });
        const text = message?.content?.text ?? '';
        const avtr = message.receiver !== selectedConversation ? userAvatar : user?.avatar?.url;
        const image = message.content.image ?? '';
      return (
        <div key={message._id} className={`chat ${chatCorner}`} ref={isLast ? lastMessageRef : null } style={{ width: '100%' }}>
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <img
                alt="User avatar"
                src={avtr}
              />
            </div>
          </div>
            <div className="chat-header">
            {name}
          </div>
          {image && (
            <div className="chat-bubble">
              <img src={image} alt="attachment" className="max-w-xs rounded-lg" />
            </div>
          )}
          {text && <div className="chat-bubble bg-[#74D4FF] break-words max-w-full whitespace-pre-wrap">{text}</div>}
          <div className="chat-footer opacity-50">{time}</div>
        </div>
      );
    })}
      </div> 
    )}
    </>
  );
}

export default MessageBody;
