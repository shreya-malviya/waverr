import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import AvatarLoading from '../../loading/AvatarLoading'
import OpenStory from './OpenStory'
import api, { BASE_URL } from '../../util'
function Stories() {
  const { user,isAuthenticated } = useSelector(state => state.user)
  const [stories, setStories] = useState([])
  const [myStory, setMyStory] = useState([])
  const [loading, setLoading] = useState(false)
  const [storyId,setStoryId] = useState(null);
  const [isDeleted , setDelete] = useState(false);
  useEffect(() => {
    const func = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/api/v1/getStories`)
        setStories(res.data.friendsStories || [])
        setMyStory(res.data.yourStory || [])
      } catch (err) {
        if(isAuthenticated)
        toast.error('error while fetching ', err.message)
      } finally {
        setLoading(false)
      }
    }

    func()
  }, [])

  useEffect(()=>{
const func = async () => {
      try {
        setLoading(true)
        // console.log('inside function... for deleting', myStory[0])
        const res = await api.delete(`/api/v1/delete/story/${myStory[0]._id}`)
        setMyStory([])
      } catch (err) {
        toast.error('error while deleting ', err.message)
        console.log("error...",err)
      } finally {
        setLoading(false)
      }
    }

    if(isDeleted) func()
  },[isDeleted])



  return (
    <>
    <div className='w-full pb-4 inline-block mr-2 mt-5 px-7'>
      <div className='flex h-[100px] sm:h-[120px] md:h-[140px]'>
        {/* Fixed left section */}
        
        <div className='flex flex-col items-center justify-center px-3 shrink-0' onClick={()=>myStory.length>0 ? setStoryId(myStory[0]) :null }>
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 ${myStory.length > 0 ? 'border-green-500' : ''
              }`}
          > {loading? <div className='w-full h-full object-cover md:p-[0.20rem] p-[0.6rem]'><AvatarLoading/></div> : 
            (
            <img
              src={user?.avatar?.url}
              alt='Your story'
              className='w-full h-full object-cover'
            />)}
            
          </div>
          <span className='text-xs mt-1'>{user?.firstName || 'unknown'}</span>
        </div>

        {/* Vertical Line */}
        <div className='w-[2px] h-[80%] my-auto bg-slate-400 mx-3' />

        {/* Scrollable user stories */}
        <div className='flex gap-4 overflow-x-auto scrollbar-hide'>
          {stories.length === 0 ?<div className="flex items-center justify-center text-gray-400 opacity-50 tracking-[0.35em] md:text-2xl font-light h-full pl-5">
    S T O R I E S
  </div>: (
            <>
            {stories.map((element, index) => (
            <div
              key={index}
              className='flex flex-col items-center justify-center'
              onClick={()=>setStoryId(element)}
            >
              <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-green-500
              }`}
          >
                <img
                  src={element?.user?.avatar?.url}
                  alt={'Story'}
                  className='w-full h-full object-cover'
                />
              </div>
              <span className='text-xs mt-1'>
                {element?.user?.firstName ?? 'unknown '}
              </span>
            </div>
          ))}
          </>
          )}
          
        </div>
      </div>
    </div>
    {storyId && 
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
    <OpenStory storyId={storyId} setStoryId={setStoryId} setDelete={setDelete} />
  </div>
      }
    </>
  )
}

export default Stories
