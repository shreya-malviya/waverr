import axios from 'axios';
import { toast } from 'react-toastify';
import { zustandStore } from '../zustand/zustand';
import { useEffect } from 'react';
import { useSocketContext } from '../socket/socket';
import { BASE_URL } from '../util';

export const handleSubmit = async ({ text, image, userId }) => {
  const messages = zustandStore(state => state.messages);
  const setMessages = zustandStore(state => state.setMessages);


  if (!text && !image) {
    toast.error("Enter something before sending...");
    return;
  }

  try {
    const res = await api.post(
  `/api/v1/send/${userId}`,
  { text, image }
);

    const newMessage = res.data;
    // toast.success("Message sent");
    setMessages([...messages, newMessage]);
  } catch (error) {
    toast.error("Failed to send the message");
    console.error("Error:", error.message);
  }
};

export const newMessageSocketListner = () => {
      const {socket} = useSocketContext();
      const {messages , setMessages} = zustandStore.getState();
      useEffect(()=>{
        socket?.on("newMessage", (newMessage) => {
          setMessages([...messages, newMessage]);
        })
        return () => socket?.off("newMessage");
      },[socket])
      console.log("updated messages : ",messages)
  }
