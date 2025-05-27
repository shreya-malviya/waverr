import { createContext, useContext, useState } from "react";
// import Peer from 'simple-peer'

const CallStreamContext = createContext();

export const StreamContext = ({children})=>{
    const [peer,setPeer] = useState(null);
    const [stream,setStream] = useState(null)
    const [localStream,setLocalStream] = useState(null);
    const [remoteStream,setRemoteStream] = useState(null);

    return(
        <CallStreamContext.Provider value={{peer,setPeer,stream,setStream,localStream,setLocalStream,remoteStream,setRemoteStream}}>{children}</CallStreamContext.Provider>
    )
}

export const useCallStream = () => useContext(CallStreamContext)