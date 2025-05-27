import React, { useEffect, useState } from 'react'
import { FaPen } from 'react-icons/fa'
import UserPosts from './UserPosts'
import { Upload } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Loading from '../../../loading/Loading'
import ConnectionReq from '../connect/ConnectionReq'
import { UseNotification } from '../../../socket/Notification'
import { ToastContainer } from 'react-toastify'
import ImageLoading from '../../../loading/ImageLoading'
import EditStory from './EditStory'
import { FaCamera } from 'react-icons/fa';
import { Lock } from "lucide-react";
import api, { BASE_URL } from '../../../util'
// import { LockOff } from "lucide-react"; 
function ShowProfile() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const {id} = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({})
  const [isUser, setIsuser] = useState(false);
  const {notification} = UseNotification()
  const [restricted,setRestricted] = useState(false);
  const[showStoryEditor ,setShowStoryEditor] = useState(false);
  useEffect(() => {
    const func = async () => {
      try {
        setLoading(true);
        const result = await api.get(`/api/v1/profile/find/${id}`)
        if (result.data.profile.user._id === user._id) setIsuser(true);
        setData(result?.data?.profile || {});
        setRestricted(result?.data?.profile?.restricted ?? false);
      } catch (error) {
        console.log("error while displaying the profile")
      } finally {
        setTimeout(()=>{
            setLoading(false);
        },500)
      }
    }
    func()
  }, [notification,id])

  return (
    <>
    {loading ? <div className='flex justify-center items-center h-[90vh]'> <Loading/> </div> :(
      
      <div className="p-4 md:p-8 md:mt-5 mt-10 md:h-[92vh] h-auto overflow-y-scroll">
      
      {/* Cover Header */}
      <div className="bg-slate-200 md:h-[8rem] h-[5rem] w-full rounded-lg" />

      {/* Avatar, Name, Bio, Edit Section */}
      <div className="flex flex-col items-center gap-4 relative -mt-12 md:-mt-20 justify-center">
        {/* Avatar */}
        <div className="shrink-0">
          <img
            src={
              data?.user?.avatar?.url ??
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-wuYiRWzSyANZx8ccFY4sQvXkI_ve46_sAw&s"
            }
            alt="avatar"
            className="rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 w-20 md:w-28 aspect-square object-cover"
          />
        </div>

        {/* Name + Bio */}
        <div className="flex flex-col items-center  flex-1 text-center">
          <h2 className="text-2xl font-semibold">
            {data?.user?.firstName + " " + data?.user?.lastName}
          </h2>
          <p className="text-gray-500 mt-1">
  {data?.bio === ''
    ? "This user has no bio yet"
    : data?.bio || "This user has no bio yet"}
</p>
        </div>

        {/* Edit Button */}
         {isUser ? (
           <div className="flex flex-row md:mt-6 mt-4 gap-4 pr-5 pb-5">
          {/* Responsive Posts + Edit Button Layout */}
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline" onClick={() => navigate("/edit/me")}>
            <FaPen />
            Edit profile
          </button>
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline " onClick={() => navigate('/me/post')}>
            <Upload size={20} />
            Post
          </button>
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline" onClick={() => setShowStoryEditor(true)}>
      <FaCamera size={20} />
      Story
    </button>

        </div>
         ) : (
          // <></>
          <ConnectionReq profile={data?.you} item={data?.user}/>
         )
       }
      </div>
      {/* Posts Section */}
       
      {restricted ? ( 
       <div className="flex flex-col h-[50vh] min-h-[30vh] mt-8">
  <div className="border-t border-gray-300 w-full"></div>
  <div className="text-center flex-col text-gray-500 flex items-center justify-center mt-20">
    <Lock className="text-red-500 text-7xl mb-4"  style={{ width: '5rem', height: '5rem' }}/>  {/* Increased size to 7xl */}
    <p className="text-xl font-semibold text-red-500">Private Account</p>
  </div>
</div>

       ) : (<><UserPosts user={data?.posts ?? []} isUser={isUser} /> </>)}
      

    </div>)} 
    {showStoryEditor && <EditStory onClose={() => setShowStoryEditor(false)} />}

  <ToastContainer position="top-center" autoClose={2000} />
    </>
    
  )
}

export default ShowProfile
