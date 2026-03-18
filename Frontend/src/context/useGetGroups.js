import React, { useEffect, useState, useCallback } from 'react'
import Cookies from "js-cookie"
import axios from "axios"
import useConversation from '../zustand/useConversation.js';
import { useAuth } from './Authprovider.jsx';

function useGetGroups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false)
    const { setUnreads, seedLastMessageAt, lastSecurityUpdate } = useConversation();
    const [authUser] = useAuth();

    const getGroups = useCallback(async () => {
        if (!authUser) return;
        setLoading(true)
        try {
            const response = await axios.get("/api/users/allgroups", {
                withCredentials: true
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
            setGroups([]);
        }
    }, [authUser, setUnreads, seedLastMessageAt, lastSecurityUpdate]);

    useEffect(() => {
        getGroups()
    }, [getGroups])

    return [groups, loading, getGroups]
}

export default useGetGroups
