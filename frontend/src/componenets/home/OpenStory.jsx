import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { X } from 'lucide-react'
import ImageLoading from './../../loading/ImageLoading'
import { useSelector } from 'react-redux'
import Delete from '../../loading/Delete'

function OpenStory({ storyId, setStoryId, setDelete }) {
    const {user} = useSelector((state)=>state.user);
    const storyRef = useRef(null)
    const timerRef = useRef(null)
    const [progress, setProgress] = useState(0)
    const [storyData, setStoryData] = useState(null)
    const [isImageLoading, setIsImageLoading] = useState(true)
    
    const ownStory  =  storyId?.user?._id === user?._id;
    // Close if clicked outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (storyRef.current && !storyRef.current.contains(e.target)) {
                setStoryId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [setStoryId])

    // Auto-close after 5 seconds
    useEffect(() => {
        timerRef.current = setTimeout(() => {
            setStoryId(null)
        }, 5000)
        return () => clearTimeout(timerRef.current)
    }, [setStoryId])

    // Animate progress bar
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 2
            })
        }, 100)

        return () => clearInterval(interval)
    }, [])

    return (
        <div
            ref={storyRef}
            className="relative bg-white rounded-lg w-[300px] h-[600px] sm:w-[360px] sm:h-[550px] shadow-lg overflow-hidden"
        >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                <div
                    className="h-full bg-blue-500 transition-all duration-10"
                    style={{ width: `${progress}%` }}
                />
            </div>
            {ownStory && 
            <div className='mt-2 ml-2' onClick={()=> setDelete(true)}>
            <Delete/>
            </div>}
            {/* Close button */}
            <div>
            <button
                onClick={() => setStoryId(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
                <X size={24} />
            </button>

            </div>
            

            {/* Story Content */}
            <div className={`w-full h-full flex items-center justify-center ${ownStory ? 'mt-0' : 'mt-10'}`}>
                {isImageLoading &&<div className='flex-1 h-[60vh] w-full justify-center items-center'> <ImageLoading /> </div> }
                {storyId && (
                    <img
                        src={storyId?.image}
                        alt="story"
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100 mt-8' 
                            }`}
                        onLoad={() => setIsImageLoading(false)}
                        onError={() => {
                            setIsImageLoading(false)
                            console.error('Image failed to load')
                        }}
                    />
                )}
            </div>
        </div>
    )
}

export default OpenStory
