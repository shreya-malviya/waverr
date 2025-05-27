import axios from 'axios';
import Loading from '../../../loading/Loading';
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import ConnectSkeleton from './ConnectSkeleton';
import { UseNotification } from '../../../socket/Notification';
import api, { BASE_URL } from '../../../util';
import { useSelector } from 'react-redux';

function Connect() {
    const [loading,setLoading] = useState(false);
    const [addNetwork,setAddNetwork] = useState([]);
    const [profile , setProfile] = useState(null);
    const {notification} = UseNotification()
    const {isAuthenticated} = useSelector((state)=>state.user)
    useEffect(()=>{
        const func = async() =>{
            try{
                setLoading(true);
                const result = await api.get(`/api/v1/addFriends`);
                setAddNetwork(result.data.filteredUsers || []);
                setProfile(result.data.profile || {})
            }catch(error){
              if(isAuthenticated)
                toast.error(error.message)
            }finally{
                    setLoading(false);
            }
        }
        func();
    },[notification])
  return (
    <>
  {loading ? (
    <div className='h-[80vh] flex-1 items-center justify-center'><Loading /></div>
    
  ) : (
    addNetwork.map((item, indx) => (
      <div key={indx}><ConnectSkeleton item={item} profile={profile}/></div>
      
    ))
  )}
  <ToastContainer position="top-center" autoClose={2000} />
</>
  )
}

export default Connect