import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const UseNotification  = () => useContext(NotificationContext);

export const NotificationProvider = ({children}) =>{
    const [notification,setNotification] = useState(null);

    return(
        <NotificationContext.Provider value = {{notification,setNotification}}>
            {children}
        </NotificationContext.Provider>   
    )
}