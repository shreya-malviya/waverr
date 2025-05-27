import { Bookmark, Heart, MessageCircle, Send } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import Delete from '../../../loading/Delete';
import PostSkeleton from '../PostSkeleton';
import { toast } from 'react-toastify';
import { CameraOff } from "lucide-react";
import api, { BASE_URL } from '../../../util';
function UserPosts({ user , isUser }) {
    const [loading,setLoading] = useState(false)
    const [isDeleted,setDeleted] = useState([]);
    useEffect(()=>{
        const func = async()=>{
            try{
                if(isDeleted.length > 0){
                const lastDeletedId = isDeleted[isDeleted.length - 1];
                setLoading(true);
                await api.delete(`/api/v1/post/delete/${lastDeletedId}`)
                toast.success("deleted successfully")
                }
                }catch(err){
                setDeleted(prev => prev.filter(id => id !== lastDeletedId));
                toast.error("error while deleting...")
                }finally{
                setLoading(false)
            }
        }
        func()
    },[isDeleted])
    return (
        <>
            <div className="relative my-10">
                <div className="border-t border-gray-300 w-full"></div>
                <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 
    text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                    Posts
                </h1>
            </div>
            {user.length === 0 ? (<div className="h-[50vh] flex flex-col items-center justify-center text-gray-500">
                <CameraOff className="w-20 h-20 mb-4 text-gray-400" />
                <div className="text-xl font-semibold">No posts</div>
              </div>
              ):
              (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
                {user.map((item, index) => !isDeleted.includes(item._id) ? (
                    
                     <div key={index} className="bg-white border rounded-lg shadow-sm">
                        {/* Top Bar */}
                       <PostSkeleton item={item} isUser={isUser} isDeleted={isDeleted} setDeleted={setDeleted}/>
                    </div>
                ) : null )}
            </div>)
              }
        </>
    );
}

export default UserPosts;
