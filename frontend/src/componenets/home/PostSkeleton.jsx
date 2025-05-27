import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageLoading from '../../loading/ImageLoading';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import axios from 'axios';
import Delete from '../../loading/Delete';
import Comment from './comments/Comment';
import api, { BASE_URL } from '../../util';

function PostSkeleton({ item, isUser = false, isDeleted, setDeleted,setPosts }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [liked, setLiked] = useState(item?.alreadyLiked ?? false);
    const [likeCount, setLikeCount] = useState(item?.likes?.length ?? 0);
    const [commentStatus,setCommentStatus] = useState(false);
    const navigate = useNavigate();
    const handleLike = async () => {
        try {
            setLiked((prev) => !prev);
            setLikeCount((prev) => prev + (liked ? -1 : 1));

 await api.put(
  `/api/v1/post/like/${item._id}`,
   // or {} if needed
  
    );
        } catch (err) {
            setLiked((prev) => !prev);
            setLikeCount((prev) => prev + (liked ? 1 : -1));
            console.error('Failed to like/unlike post:', err);
        }
    };

    return (
        <>
            <div
                className="flex items-center justify-between px-4 py-2 cursor-pointer"
                onClick={() => navigate(`/profile/${item?.user?._id}`)}
            >
                <div className="flex items-center gap-3">
                    <img
                        src={item?.user?.avatar?.url}
                        alt="avatar"
                        className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                        <p className="font-semibold text-sm">{item?.user?.firstName ?? 'Name'}</p>
                        <p className="text-xs text-gray-500">{item?.location ?? 'somewhere'}</p>
                    </div>
                </div>
                {isUser &&
                    <div onClick={() => {
                        const confirmed = window.confirm("Are you sure you want to delete this post?");
                        if (confirmed) {
                            setDeleted(prev => [...prev, item._id]);
                        }
                    }}>
                        <Delete />
                    </div>}

            </div>

            {/* Post Image */}
            <div className="w-full aspect-[3/2] overflow-hidden bg-gray-200 relative">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-300 animate-pulse">
                        <span className="text-sm text-gray-500">
                            <ImageLoading />
                        </span>
                    </div>
                )}
                <img
                    src={item?.media[0]?.url}
                    alt="post"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center px-4 py-2">
                <div className="flex gap-4">
                    <Heart
                        className="cursor-pointer"
                        fill={liked ? 'red' : 'none'}
                        stroke={liked ? 'red' : 'currentColor'}
                        onClick={handleLike}
                    />
                    <MessageCircle className="cursor-pointer" onClick={()=>setCommentStatus(true)} />
                        {commentStatus &&  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
    <Comment item={item} setCommentStatus={setCommentStatus} setPosts={setPosts} />
  </div>
}
                    <Send className="cursor-not-allowed text-gray-400 pointer-events-none" />

                </div>
                    <Bookmark className="cursor-not-allowed text-gray-400 pointer-events-none" />
            </div>

            {/* Likes */}
            <div className="px-4 pb-3 text-sm font-medium">
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </div>
        </>
    );
}

export default PostSkeleton;
