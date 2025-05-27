import React from 'react'
import './loading.css'
function Loading() {
    return (
        <div className="loader flex-1 justify-center items-center h-full w-full">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
        </div>
    )
}

export default Loading