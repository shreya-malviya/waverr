
import React, { useEffect, useState } from 'react'
import { CameraOff } from "lucide-react";
import axios from 'axios'
import ImageLoading from '../../loading/ImageLoading';
import Loading from '../../loading/Loading';
import { useNavigate } from 'react-router-dom';
import PostSkeleton from './PostSkeleton';
import { toast } from 'react-toastify';
import api, { BASE_URL } from '../../util';
import { useSelector } from 'react-redux';
function Post() {
  const [loading,setLoading]  = useState(false)
  const [posts,setPosts] = useState([]);
  const [isDeleted,setDeleted] = useState([]);
  const {isAuthenticated} = useSelector((state)=>state.user)
  useEffect(()=>{
    const func = async()=>{
      try{
        setLoading(true);
        const posts = await api.get(`/api/v1/posts/findAll`)
        // console.log("posts.data.posts ",posts.data.posts)
        setPosts(posts?.data?.posts || [])
      }catch(err){
        if(isAuthenticated)
        toast.error("error while finding posts")
      }finally{
        setTimeout(()=>{
          setLoading(false)
        },500)
        
      }
    }
    func()
  },[])
  return (
    <>
    {loading ? <div className='flex justify-center items-center h-[50vh]'> <ImageLoading/> </div>: (  <>
      {posts.length === 0 ? (
      <div className="h-[50vh] flex flex-col items-center justify-center text-gray-500">
    <CameraOff className="w-20 h-20 mb-4 text-red-400" />
    <div className="text-xl font-semibold">No posts</div>
  </div>) : 
      <div className="space-y-6 p-2 sm:p-4 ">
      {posts.map((item, index) => (
        //  const [imageLoaded, setImageLoaded] = useState(false);
        <div key={index} className="bg-white border rounded-lg shadow-sm">
          {/* Top Bar */}
          <PostSkeleton item={item} isDeleted={isDeleted} setDelete={setDeleted} setPosts={setPosts} />  
        </div>
      ))}
    </div>
    }
       
    </>)}
  
    </>
  )
}

export default Post