import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie"
import axios from "axios"
import useConversation from '../zustand/useConversation.js';

function useGetGroups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false)
    const { setUnreads, seedLastMessageAt } = useConversation();

    useEffect(() => {
        const getGroups = async () => {
            setLoading(true)
            try {
                const token = Cookies.get("jwt");
                const response = await axios.get("/api/users/allgroups", {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setGroups(response.data);

                // Sync group unread counts and seed lastMessageAt
                response.data.forEach(group => {
                    if (group.unreadCount > 0) {
                        setUnreads(prev => ({ ...prev, [group._id]: group.unreadCount }));
                    }
                    if (group.lastMessageAt) {
                        seedLastMessageAt(group._id, group.lastMessageAt);
                    }
                });

                setLoading(false);
            } catch (error) {
                console.log("Error in useGetGroups " + error);
                setLoading(false);
            }
        }
        getGroups()
    }, [setUnreads])
    return [groups, loading]
}

export default useGetGroups
