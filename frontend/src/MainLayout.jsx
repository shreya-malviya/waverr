
import React, { useEffect } from 'react'
import Settings from './componenets/home/Settings';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Loading from './loading/Loading';

function MainLayout({children}) {
  const { isAuthenticated,loading } = useSelector(state => state.user)  
  const navigate = useNavigate()
  useEffect(()=>{
    // console.log("is auth and loading",isAuthenticated, loading)
    if (!isAuthenticated && !loading) {
        navigate("/auth")
    }
    },[isAuthenticated,loading])
    return (
      <>
      {loading?(<div className='h-[90vh] flex-1 justify-center items-center'> <Loading/> </div>) : (<div className="flex w-[100%]">
          {/* Sidebar visible only on md and up */}
          <div className="w-auto shrink-0">
            <Settings/>
          </div>
    
          {/* Page Content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>)}</>
        
      );
    
}

export default MainLayout