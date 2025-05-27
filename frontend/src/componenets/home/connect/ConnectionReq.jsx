import React, { useEffect, useState } from 'react'
import { FaUserPlus, FaHourglassHalf, FaUserTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UseNotification } from '../../../socket/Notification';
import { useSelector } from 'react-redux';
import api, { BASE_URL } from '../../../util';
function ConnectionReq({profile,item}) {
  const [isSending, setIsSending] = useState(false);
  const {user} = useSelector((state)=>state.user)
  const [isSent, setIsSent] = useState(false);
    useEffect(()=>{
        if(!profile || !item) return;
        const hasPendingRequest = (profile?.friendReqStatus || []).some(req => req.user === item._id) || (profile?.friends).includes(item._id) ;
        if(hasPendingRequest){
            setIsSent(true);
        }
    },[item,profile])
  
  const handleClick = async () => {
    setIsSending(true);
    try {
      if (!isSent) {
        await api.post(`/api/v1/sendRequest/${item._id}`);
        toast.success('Friend request sent');
        setIsSent(true);
      } else {
        await api.delete(`/api/v1/cancelRequest/${item._id}`);
        toast.info('Friend request cancelled');
        setIsSent(false);
      }
    } catch (error) {
      console.error('Request failed:', error);
      toast.error(isSent ? 'Failed to cancel request' : 'Failed to send request');
    } finally {
      setIsSending(false);
    }
  };
    return (

    <>
    <button
            onClick={handleClick}
            disabled={isSending}
            className={`text-xl ${isSent ? 'text-[#FB2C36]' : 'text-[#74D4FF]'}`}
          >
            {isSending ? (
              <FaHourglassHalf className="animate-spin" />
            ) : isSent ? (
              <FaUserTimes />
            ) : (
              <FaUserPlus />
            )}
          </button>
    </>
  )
}

export default ConnectionReq