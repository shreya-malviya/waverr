import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import axios from 'axios';
import Connect from '../home/connect/Connect';
import ConnectSkeleton from '../home/connect/ConnectSkeleton';
import Loading from '../../loading/Loading';
import api, { BASE_URL } from '../../util';

function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [profiles, setProfiles] = useState([]);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [profile,setProfile] = useState({});
    useEffect(() => {
        if (searchTerm === '') {
            setProfiles([]);
            setLoading(false);
            return;
        }

        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(() => {
            fetchProfiles();
        }, 500);

        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/search/Users`, {
                params: { search: searchTerm },
            });
            console.log("profile data is : ", res.data)
            setFilteredUsers(res?.data?.filteredUsers ?? []);
            setProfile(res?.data?.profile ?? {})
        } catch (err) {
            console.error('Error fetching profiles:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:mt-4 mt-10 bg-white">
             <div
    className="md:static fixed top-[47px] left-0 right-0 z-20 bg-white px-4 pt-2 pb-3 border-b border-gray-200"
  >
    <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white">
      <FiSearch className="text-gray-500 mr-2" />
      <input
        type="text"
        placeholder="Search profiles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="outline-none w-full bg-white"
      />
    </div>
  </div>

            {/* Output */}
            <div className="mt-16 md:mt-4 overflow-y-scroll h-auto md:h-[76.5vh]">
                {searchTerm === '' ? (
                    <Connect />
                ) : loading ? (
                    <div className="text-gray-500 text-center mt-4"><div className='h-[75vh] md:h-[80vh]'><Loading/></div></div>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((item, indx) => (
                            <div key={indx}><ConnectSkeleton item={item} profile={profile}/></div>
                        ))
                ) : (
                    <div className="text-gray-400 text-center mt-4">No profiles found</div>
                )}
            </div>
        </div>
    );
}

export default Search;
