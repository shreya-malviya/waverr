import React, { useEffect, useRef, useState } from 'react'
import { zustandStore } from '../../zustand/zustand';
import { Bell, Search, Upload } from 'lucide-react';
import { MdPersonAddAlt } from "react-icons/md";
import Stories from './Stories';
import Post from './Post';
import Connect from './connect/Connect';
import { UseNotification } from '../../socket/Notification';
import axios from 'axios';
import NotificationDropdown from './notification/NotificationDropdown';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api, { BASE_URL } from '../../util';
import { toast } from 'react-toastify';
function Home() {
  const { activeTab, setActiveTab } = zustandStore();
  const navigate = useNavigate();
  const { notification } = UseNotification()
  const [notificationData, setNotificationData] = useState(null);
  const [loading,setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false); // <- toggle
  const {user , isAuthenticated } = useSelector((state)=>state.user)
  useEffect(()=>{
    if(!user || !isAuthenticated) return;
    const func = async(req,res,next)=>{
      try{
        setLoading(true)
        const result = await api.get(`/api/v1/fetchNotification`);
        setNotificationData(result.data || [])
        // console.log("notification fetched from home ", result.data || [])
      }catch(error){
        if(isAuthenticated)
          toast.error("error while fetching notification")
      }finally{
        setLoading(false)
      }
    }
    func();
  },[notification])
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const RedDot = () => (
    <span className="absolute top-0 right-0 bg-red-500 h-2 w-2 rounded-full"></span>
  );

  return (
    <div className='md:mt-4 mt-10'>
    <div className="w-full justify-between items-center pl-4 pr-4 pb-4 border-b border-gray-200 md:flex hidden pt-2">
  {/* Left: Search */}
  <div className="relative w-1/3 ml-6" onClick={()=>navigate('/search')}>
    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
    <input 
      type="text" 
      placeholder="Search"
      className="w-full pl-10 py-2 rounded-full bg-blue-100 outline-none" 
    />
  </div>

  {/* Right Icons */}
  <div className="flex items-center space-x-6">
  <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setShowDropdown((prev) => !prev)}
        className="cursor-pointer relative"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {notificationData && notificationData.length > 0 && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full" />
        )}
      </div>

      {showDropdown && (
        <NotificationDropdown notifications={notificationData} setNotification={setNotificationData}/>
      )}
    </div>

    <div className="flex items-center space-x-2 bg-[#9EE1FF] px-3 py-2 rounded-full cursor-pointer" onClick={()=>navigate(`/profile/${user._id}`)}>
      <span>Upload</span>
      <Upload size={18} />
    </div>
    
    {/* Divider */}
    <div className="h-10 w-[2px] bg-gray-0 mx-2"></div>

    {/* Add to Network */}
    <div className="hidden md:flex flex-col items-center justify-center text-sm font-medium text-gray-700">
      <span className="w-[5rem] mb-1"></span>
    </div>
  </div>
</div>

<div className="flex flex-col md:flex-row h-auto md:h-[84vh] ">
  {/* LEFT COLUMN */}
  <div className="flex flex-col w-full md:w-[100%]  md:overflow-hidden md:overflow-y-scroll">
    
    {/* Fixed Stories Height */}
    <div className="shrink-0">
      <Stories />
    </div>
      <div className="border-t border-gray-300 w-[auto] md:mx-12 mx-8 "></div>
    {/* Scrollable Post Section */}
    <div className="flex-1 shrink-0 ml-4 mr-4  p-2">
      <Post />
    </div>
    </div>

  {/* RIGHT COLUMN - Suggestions */}
  <div className="hidden md:block md:w-[40%]  p-4 overflow-y-auto justify-center items-center">
    <Connect/>
  </div>
</div>
    </div>
  )
}

export default Home