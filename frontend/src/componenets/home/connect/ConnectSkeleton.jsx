import React, { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import ConnectionReq from './ConnectionReq';

function ConnectSkeleton({ item , profile }) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between p-3 border rounded-md mb-2 shadow-md hover:shadow-[0_4px_15px_0_#9EE1FF] transition-shadow duration-300">
      <div className="flex items-center gap-4 cursor-pointer" onClick={()=>navigate(`/profile/${item._id}`)}>
        <img src={item.avatar.url} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
        <span className="text-lg font-semibold">{item.firstName}</span>
      </div>
      
      
      <ConnectionReq profile={profile} item={item}/>
    </div>
  );
}

export default ConnectSkeleton;
