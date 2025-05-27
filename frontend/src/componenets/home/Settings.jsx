import React, { useEffect, useRef, useState } from "react";
import wavierrLogo from "../../assets/waverr.svg";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../action/userAction";
import { FiPhoneCall, FiX } from "react-icons/fi";

import {
  FiMessageCircle,
  FiUsers,
  FiPhone,
  FiGlobe,
  FiLogOut,
  FiSettings,
  FiPlusSquare,
  FiSearch,
  FiHome,
  FiUser
} from "react-icons/fi";
import { FaPen } from "react-icons/fa";
import { Bell, Search } from 'lucide-react';


import { zustandStore } from "../../zustand/zustand";
import NotificationDropdown from "./notification/NotificationDropdown";
import { UseNotification } from "../../socket/Notification";
import axios from "axios";
import api, { BASE_URL } from "../../util";

function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const { selectedConversation } = zustandStore();

  const handleLogout = async () => {
    console.log("handled logout and navigated to : /auth");
    await dispatch(logout());
    navigate("/auth");
  };
  const [showBottomMenu, setShowBottomMenu] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        // Scrolling down
        setShowBottomMenu(false);
      } else {
        // Scrolling up
        setShowBottomMenu(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);


  // notification 

  const { notification } = UseNotification()
  const [notificationData, setNotificationData] = useState(null);
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false); // <- toggle
  useEffect(() => {
    const func = async (req, res, next) => {
      try {
        setLoading(true)
        const result = await api.get(`/api/v1/fetchNotification`);
        setNotificationData(result.data || [])
      } catch (error) {
        console.log('something seems off...', error)
      } finally {
        setLoading(true)
      }
    }
    func();

  }, [notification])
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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuOpen]);
  
  return (
    <>
      <div className="hidden md:flex justify-center py-6 h-[100vh] w-full">
        <div className="w-full border-r border-gray-300 rounded-lg flex flex-col justify-between items-center overflow-hidden px-2 py-2">
          <div className="flex flex-col items-center gap-6">
            <img src={wavierrLogo} alt="Wavierr Logo" className="w-24" />

            <div className="flex flex-col gap-6 text-gray-600 text-2xl items-center mt-4">
              <div className="avatar">
                <div
                  className="relative w-20 h-20 cursor-pointer p-[5.5px]"
                  onClick={() => navigate(`/profile/${user._id}`)}
                >
                  <img
                    src={
                      user?.avatar?.url ??
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-wuYiRWzSyANZx8ccFY4sQvXkI_ve46_sAw&s"
                    }
                    alt="avatar"
                    className="rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
                  />
                  <div className="absolute bottom-0 right-0 bg-primary p-1 rounded-full text-white">
                    <FaPen size={10} />
                  </div>
                </div>
              </div>
              <FiHome
                className="hover:text-blue-500 cursor-pointer"
                onClick={() => navigate("/")}
              />
              <FiMessageCircle
                className="hover:text-blue-500 cursor-pointer"
                onClick={() => navigate("/message")}
              />
              <Search
                className="hover:text-blue-500 cursor-pointer"
                onClick={() => navigate("/search")} // have to check later
              />
              <FiPhone
                className="hover:text-blue-500 cursor-pointer"
                onClick={() => navigate("/call")}
              />
            </div>
          </div>

          {/* Bottom: Settings + Logout */}
          <div className="flex flex-col gap-6 text-gray-600 text-2xl items-center">
            <FiSettings className="hover:text-blue-500 cursor-pointer" />
            <FiLogOut
              onClick={handleLogout}
              className="hover:text-red-500 cursor-pointer"
              title="Logout"
            />
          </div>
        </div>
      </div>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white w-full shadow-sm px-4 py-3">
  {!menuOpen ? (
    <div className="flex justify-end items-center space-x-4">
      {/* Notification */}
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
          <NotificationDropdown notifications={notificationData} setNotification={setNotificationData} />
        )}
      </div>

      {/* Hamburger */}
      <div onClick={toggleMenu} className="cursor-pointer">
        <svg
          className="w-6 h-6 text-gray-800"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </div>
    </div>
  ) : (
    <div onClick={toggleMenu} className="flex justify-end">
      <FiX
        className="text-2xl cursor-pointer hover:text-red-600"
        title="Close"
      />
    </div>
  )}
</div>
      {menuOpen && (
        <div className="md:hidden fixed  bg-white z-40 h-[100vh] flex w-full justify-center items-center p-6 gap-6 overflow-x-hidden">
          <ul className="space-y-14 text-3xl">
            <li>
              {" "}
              <div className="avatar" onClick={() => {navigate(`/profile/${user._id}`); toggleMenu()}} >
                <div
                  className="relative w-24 h-24 cursor-pointer p-[5.5px]"
                >
                  <img
                    src={
                      user?.avatar?.url ??
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-wuYiRWzSyANZx8ccFY4sQvXkI_ve46_sAw&s"
                    }
                    alt="avatar"
                    className="rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
                  />
                  <div className="absolute bottom-0 right-0 bg-primary p-1 rounded-full text-white">
                    <FaPen size={10} />
                  </div>
                </div>
              </div>
            </li>
            <li>
              <FiSettings className="hover:text-blue-500 cursor-pointer ml-6" />
            </li>
            <li>
              <FiLogOut
                onClick={handleLogout}
                className="hover:text-red-500 cursor-pointer ml-6"
                title="Logout"
              />
            </li>
          </ul>
        </div>
      )}
      {!showBottomMenu || menuOpen || selectedConversation ? null :
        <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md shadow-lg rounded-3xl px-6 py-4 flex items-center justify-center gap-6 z-50">
          <FiHome className="text-2xl hover:text-blue-500 transition-all duration-200 cursor-pointer" onClick={() => navigate('/')} />
          <FiSearch className="text-2xl hover:text-blue-500 transition-all duration-200 cursor-pointer" onClick={() => navigate('/search')} />

          <div className="w-14 h-10 flex items-center justify-center rounded-full bg-[#74D4FF] text-white shadow-md hover:bg-blue-600 transition-all duration-200 cursor-pointer">
            <FiPlusSquare className="text-xl" onClick={()=> navigate(`/profile/${user._id}`)}/>
          </div>

          <FiMessageCircle className="text-xl hover:text-blue-500 transition-all duration-200 cursor-pointer" onClick={() => navigate('/message')} />
          <FiPhoneCall className="text-xl hover:text-blue-500 transition-all duration-200 cursor-pointer" onClick={() => navigate('/call')} />
        </div>}

    </>
  );
}

export default Settings;
