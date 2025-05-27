import React, { useEffect, useState } from "react";
import { Check, X, BellOff } from "lucide-react";
import axios from "axios";
import api, { BASE_URL } from "../../../util";
import Loading from "../../../loading/Loading";

export default function NotificationDropdown({ notifications, setNotification }) {
    const [requestStatus, setRequestStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    // console.log("inside notification",notifications)
    const handleDecision = async (notifId, senderId, decision) => {
        try {
            setLoading(true);
            await api.put(
                `/api/v1/updateFriend/${senderId}`,
                { userDecision: decision },
            );
            setNotification(prev => prev.filter(n => n._id !== notifId));
        } catch (error) {
            console.error("Error handling request:", error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-[40vh] md:w-80 bg-white shadow-lg rounded-md border z-50 max-h-96 overflow-y-auto">
            <div className="p-4 font-semibold border-b text-center text-gray-700">
                Friend Requests
            </div>

            {(!notifications || notifications.length === 0) ? (
                <div className="flex flex-col items-center justify-center p-6 text-gray-500 text-sm">
                    <BellOff className="w-10 h-10 mb-2 text-gray-400" />
                    <p>No new friend requests</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                    <>
                        {loading ? <div className="flex justify-center items-center max-h-96 mt-2 w-[40vh] md:w-80"> <Loading/> </div> : (
                            <>{notifications.map((notif, index) => (
                        <li key={index} className="p-3 flex items-center space-x-3 hover:bg-gray-50">
                            {/* Avatar */}
                            <img
                                src={notif?.sender?.avatar?.url || "/default-avatar.png"}
                                alt="avatar"
                                className="w-12 h-12 rounded-full object-cover"
                            />

                            {/* Name & Date */}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">{notif?.sender?.firstName || "Error"}</p>
                                <p className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleString()}</p>
                            </div>

                            {/* Accept / Reject buttons */}
                            <div className="flex space-x-2">
                                <button className="text-green-600 hover:text-green-800" onClick={() => handleDecision(notif._id, notif.sender._id, "accept")}
                                >
                                    <Check size={18} />
                                </button>
                                <button className="text-red-600 hover:text-red-800" onClick={() => handleDecision(notif._id, notif.sender._id, "reject")}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </li>
                    ))} </>
                        ) }
                    </>
                    
                </ul>
            )}
        </div>
    );
}
