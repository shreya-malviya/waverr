import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axios from 'axios';
import api, { BASE_URL } from '../../../util';

function Comment({ item, setCommentStatus,setPosts }) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const modalRef = useRef(null);
  const [loading,setLoading] = useState(false)
  const { user, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    setComments(item.comments || []);
  }, [item]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setCommentStatus(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setCommentStatus]);

 const handleSend = async () => {
  if (!isAuthenticated) return toast.error("Login to access comments");
  if (!newComment.trim()) return;
  if (newComment.length > 100) {
    toast.error("Comment too long");
    return;
  }

  // Create comment with a temporary ID
  const tempId = Date.now(); // Unique enough for temporary use
  const commentToAdd = {
    _id: tempId, // Use this for rollback
    message: newComment,
    createdAt: new Date().toISOString(),
    user: {
      firstName: user.firstName || "Anonymous",
      avatar: {
        url: user.avatar?.url || "https://static.remove.bg/sample-gallery/graphics/bird-thumbnail.jpg",
      },
    },
  };

  try {
    setLoading(true);

    // Optimistically add the comment
    setComments(prev => [commentToAdd, ...prev]);
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === item._id
          ? {
              ...post,
              comments: [commentToAdd, ...(post.comments || [])],
            }
          : post
      )
    );
    // Make the API call
    await api.post(
      `/api/v1/post/comment/${item._id}`,
      { comment: commentToAdd.message },
    );

    setNewComment('');
  } catch (err) {
    // Remove the optimistic comment
    setComments(prev => prev.filter(c => c._id !== tempId));
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === item._id
          ? {
              ...post,
              comments: (post.comments || []).filter(c => c._id !== tempId),
            }
          : post
      )
    );

    toast.error("Failed to post comment");
    console.log("error",err)
  } finally {
    setLoading(false);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white w-[80vw] md:w-[80%] p-6 rounded-lg shadow-lg relative" ref={modalRef}>
      <button
        onClick={() => setCommentStatus(false)}
        className="absolute top-2 right-2 text-black"
      >
        ✖
      </button>

      <p className="text-black font-semibold mb-4">Comments</p>

      <div className="mb-4 max-h-[70vh] h-[60vh] overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet!</p>
        ) : (
          comments.map((cmt, idx) => (
            <div
              key={idx}
              className="mb-3 p-3 bg-gray-100 rounded shadow-sm flex items-start gap-3"
            >
              <img
                src={cmt.user?.avatar?.url || "https://via.placeholder.com/40"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-sm">{cmt.user?.firstName || "Anonymous"}</p>
                <p className="text-gray-800 text-sm">{cmt.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center border rounded px-3 py-2">
        <input
          type="text"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          className="flex-grow outline-none text-sm"
        />
        <Send
          className="ml-2 text-blue-500 cursor-pointer hover:scale-105"
          onClick={handleSend}
        />
      </div>
    </div>
  );
}

export default Comment;
