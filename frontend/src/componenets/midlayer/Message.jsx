import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MessageSkeleton from './messages/MessageSkeleton';
import axios from 'axios';
import { zustandStore } from '../../zustand/zustand';
import { toast } from 'react-toastify';
import { useSocketContext } from '../../socket/socket';
import { useNavigate } from 'react-router-dom';
import Loading from '../../loading/Loading';
import { User } from 'lucide-react';
// import { useCall } from '../../socket/Callcontext';
import { UserPlus } from "lucide-react";
import { Users } from "lucide-react";
import api, { BASE_URL } from '../../util';


function Message() {
  let [userId, setUserId] = useState(null);
  let [userName, setUserName] = useState(null);
  let [userAvatar, setUserAvatar] = useState(null);
  const navigate = useNavigate()
  const { onlineUsers, socket } = useSocketContext()
  const { activeTab, messages, setMessages } = zustandStore();
  const [users, setUsers] = useState([]);
  const selectedConversation = zustandStore(state => state.selectedConversation);
  const setSelectedConversation = zustandStore(state => state.setSelectedConversation);
  const [selected, setSelected] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false);
    }, 500)
  }, [])
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  useEffect(() => {
    const func = async () => {
      try {
        const data = await api.get(`/api/v1/allusers`)
        // console.log("inside messages",data?.data?.filteredUsers ?? [])
        setUsers(data?.data?.filteredUsers ?? []);
        // console.log("logging messages ",data.filteredUsers)
      } catch (error) {
        console.log("went inside error : ", error)
        toast.error("error while fetching users")
      }
    }
    if (activeTab) func();
  }, [activeTab, messages, setMessages])
  const handleBack = () => {
    setSelectedConversation(null),
      setSelected(false)
  }
  return (
    <>
      {isLoading ? (<div className='h-[90vh] flex-1 justify-center items-center'> <Loading /> </div>) : (
        <div className='mt-20 md:mt-6'>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500">
              <div className="mb-4">
                <UserPlus className="w-24 h-24 text-gray-400" />
              </div>
              <div className="text-xl font-semibold">Add friends to start texting...</div>
            </div>

          ) : (
            <div className='h-full w-full flex'>

              <div className={`
      h-[87vh] px-4 border-r border-gray-300 flex flex-col gap-4 overflow-auto
      ${selected ? 'hidden' : 'block'} 
      md:h-[92vh]
      md:block

      md:w-[25%] w-full
    `}>

                {/* Line */}


                {/* Horizontal Avatars */}
                <div className="flex overflow-x-auto space-x-4 px-1 custom-scrollbar mb-2">
                  {users.map((friend) => (
                    <img
                      key={friend?.friendId}
                      src={friend?.friendUser?.avatar?.url ?? "default-url"}
                      alt={friend?.friendUser?.firstName}
                      className="w-20 h-20 rounded-full border-2 border-blue-400 shrink-0"
                      onClick={() => navigate(`/profile/${friend?.friendId}`)}
                    />
                  ))}
                </div>
                  <div className='border-t border-gray-300 w-full'></div>
                {/* FRIENDS LIST */}
                <div
                  className="space-y-3 pt-4 px-2 md:overflow-y-scroll h-auto md:overflow-x-hidden md:h-[78vh]"
                >
                  {users.map((friend) => (
                    <div
                      key={friend?.friendId}
                      className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition shadow"
                      onClick={() => {
                        setUserId(friend?.friendId);
                        setUserAvatar(friend?.friendUser?.avatar?.url ?? "default-url");
                        setUserName(friend?.friendUser?.firstName);
                        setSelected(true);
                      }}
                    >
                      <img src={friend?.friendUser?.avatar?.url ?? "default-url"} className="w-10 h-10 rounded-full" />
                      <div>
                        <div className="flex items-center">
                          <div className="font-semibold">{friend?.friendUser?.firstName}</div>
                          {onlineUsers.includes(friend?.friendId) && (
                            <span className="ml-2 w-2.5 h-2.5 rounded-full bg-green-500"></span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate min-w-[100px]">
                          {friend?.lastMessageText
                            ? friend.lastMessageText.length > 18
                              ? `${friend.lastMessageText.substring(0, 15)}...`
                              : friend.lastMessageText
                            : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MESSAGE AREA */}
              {(userId !== null && selected) ? (
                <div className="w-full md:flex-1 p-6 block md:block g-[100vh]">
                  {/* Back Arrow - phone only */}
                  <div className="md:hidden mb-4 absolute top-14 z-100">
                    <button
                      onClick={() => handleBack()}
                      className="flex items-center text-blue-500 hover:text-blue-700"
                    >
                      ← Back to Messages
                    </button>
                  </div>

                  <MessageSkeleton
                    userId={userId}
                    userAvatar={userAvatar}
                    userName={userName}
                  />
                </div>
              ) : (
                <>
                {!isLoading &&
                (<div className="flex-1  flex-col items-center justify-center text-gray-500 md:flex hidden">
                  <Users className="w-20 h-20 mb-4 text-blue-500" />
                  <p className="text-lg font-semibold">Select a user to start a conversation</p>
                </div>)
                }
                </>
              )}
            </div>)
          }

        </div>
      )}
    </>

  );
}

export default Message;
