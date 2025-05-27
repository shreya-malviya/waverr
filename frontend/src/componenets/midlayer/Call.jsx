import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Loading from '../../loading/Loading';
import CallHistory from './callHistory/CallHistory';
import { PhoneOff } from "lucide-react";
import api, { BASE_URL } from '../../util';
import { useSelector } from 'react-redux';
function Call() {
  const [loading, setLoading] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const {user,isAuthenticated} = useSelector((state)=>state.user)
  useEffect(() => {
    if(!user || !isAuthenticated) return;
    const func = async () => {
      try {
        setLoading(true);
        const result = await api.get(`/api/v1/callHistory`)
        setCallHistory(result.data.result || []);
      } catch (error) {
        console.log("error");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500)
      }
    }

    func();
  }, [])

  return (
    <>
      {/* <div className='h-[100vh] flex-1'>
      <Loading/>
    </div> */}
      {loading ?
        <div className='h-[100vh] flex-1 justify-center items-center w-full'>
          <Loading />
        </div> :
        <div className='md:h-[100vh] flex-1 md:mt-0 mt-[2.5rem] overflow-auto h-auto'>
          {callHistory.length === 0 ? <div className="h-[90vh] flex-1 flex flex-col items-center justify-center text-gray-500">
            <PhoneOff className="w-20 h-20 mb-4 text-red-400" />
            <div className="text-xl font-semibold">No call history</div>
          </div>
            :
            (<div className='overflow-y-scroll h-[auto] md:p-6 pl-6 pr-6 pb-6'>
              <CallHistory callHistory={callHistory} />
            </div>)}

        </div>
      }
    </>
  )
}

export default Call