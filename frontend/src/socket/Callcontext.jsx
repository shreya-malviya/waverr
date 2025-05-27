import { createContext,useContext, useState } from "react";

const CallContext = createContext();

export const CallProvider = ({children}) =>{
    const [incomingCall , setIncomingCall] = useState(null)
    const [onCall , setOnCall] = useState(false)
    const [callType,setCallType] = useState(null);

    return(
        <CallContext.Provider value= {{incomingCall,setIncomingCall,onCall,setOnCall,callType,setCallType}}>{children}</CallContext.Provider>
    )
}

export const useCall = () => useContext(CallContext)