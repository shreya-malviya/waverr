import React from 'react'
import { useSelector } from 'react-redux'
import { Video, PhoneIncoming, VideoIcon, PhoneIcon, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
function CallHistorySkeleton({ item }) {
    const { user } = useSelector((state) => state.user);
    const participant = item.participants[0];
    const isOutgoing = item.startedBy === user._id;
    const isMissed = item.status !== 'ended';
    const isVideo = item.type === 'video';

    const iconColor = isMissed && !isOutgoing ? 'text-[#FB2C36]' : 'text-[#05DF72]';

    const getDirectionIcon = () => {
        if (isOutgoing) return <ArrowUpRight className={`w-5 h-5 ${iconColor}`} />;
        return isVideo
            ? <VideoIcon className={`w-5 h-5 ${iconColor}`} />
            : <PhoneIncoming className={`w-5 h-5 ${iconColor}`} />;
    };
    return (
        <div className="flex items-center gap-4 p-4 border-b">
            <img
                src={participant.avatar?.url}
                alt={participant.firstName}
                className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
                <div className={`font-medium ${iconColor}`}>{participant.firstName}</div>
                <div className="text-sm text-gray-500">
                    {new Date(item.startedAt).toLocaleString()}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {getDirectionIcon()}
                {/* {isVideo ? <Video className="w-5 h-5 text-gray-600" /> : <PhoneIcon className="w-5 h-5 text-gray-600" />} */}
            </div>
        </div>
    );
}

export default CallHistorySkeleton