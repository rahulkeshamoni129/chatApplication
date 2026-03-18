import React, { useEffect, useState, useCallback } from 'react'
import Cookies from "js-cookie"
import axios from "axios"
import useConversation from '../zustand/useConversation.js';
import { useAuth } from './Authprovider';

function userGetAllUsers() {
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false)
    const { setUnreads, seedLastMessageAt, lastSecurityUpdate } = useConversation();
    const [authUser] = useAuth();

    const getUsers = useCallback(async () => {
        if (!authUser) return;
        setLoading(true)
        try {
            const response = await axios.get("/api/users/allusers", {
                withCredentials: true
            })
            setAllUsers(response.data);

            // Sync unread counts and seed lastMessageAt from backend
            response.data.forEach(user => {
                setUnreads(prev => ({ ...prev, [user._id]: user.unreadCount || 0 }));
                
                if (user.lastMessageAt) {
                    seedLastMessageAt(user._id, user.lastMessageAt);
                }
            });

            setLoading(false);
        } catch (error) {
            console.log("Error in useGetAllUsers " + error);
            setLoading(false);
            // If it was a network error, we want to allow retrying later
            setAllUsers([]);
        }
    }, [authUser, setUnreads, seedLastMessageAt, lastSecurityUpdate]);

    useEffect(() => {
        getUsers()
    }, [getUsers])

    return [allUsers, loading, getUsers]
}

export default userGetAllUsers