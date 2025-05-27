import { createContext, useContext, useEffect, useState } from "react";
import {useSelector} from 'react-redux'
import io from 'socket.io-client'
import { BASE_URL } from "../util";

const SocketContext = createContext();

export const useSocketContext=()=>{
    return useContext(SocketContext);
}

export const SocketContextProvider = ({children})=>{
    const [socket,setSocket] = useState(null);
    const [onlineUsers,setOnlineUsers] = useState([])
    const {user} = useSelector((state)=>state.user);

    useEffect(()=>{
        if(user?._id){
            const socketInstance = io(BASE_URL,{
                query:{
                    userId : user._id
                },
                transports:["websocket"]
            })
            setSocket(socketInstance);

            // for all online users
            socketInstance.on("getOnlineUsers",(users)=>{
                setOnlineUsers(users)
                // console.log("users : ", users)
            })
            return () => {
                socketInstance.disconnect();
                setSocket(null);
            }
        }
    },[user?._id]) // connect whenever the user changes 
    return (
        <SocketContext.Provider value = {{socket,onlineUsers}}>
            {children}
        </SocketContext.Provider>
    )
}

