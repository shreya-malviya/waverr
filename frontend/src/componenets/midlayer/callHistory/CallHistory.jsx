import React from 'react'
import CallHistorySkeleton from './CallHistorySkeleton'

function CallHistory({callHistory}) {
  return (
    <>
    <h2 className="text-center text-xl font-semibold my-4 text-[#74D4FF]">Call History</h2>
    <div className='overflow-auto'>
        {
            callHistory.map((item,indx)=>{
                return (
                <div key={indx}>
                    <CallHistorySkeleton item={item}/>
                </div>
                )
            })
        }
    </div>
    </>
  )
}

export default CallHistory