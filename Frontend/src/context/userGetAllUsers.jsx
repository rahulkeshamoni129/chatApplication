import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie"
import axios from "axios"
import useConversation from '../zustand/useConversation.js';

function userGetAllUsers() {
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false)
    const { setUnreads, seedLastMessageAt } = useConversation();

    useEffect(() => {
        const getUsers = async () => {
            setLoading(true)
            try {
                const response = await axios.get("/api/users/allusers", {
                    withCredentials: true
                })
                setAllUsers(response.data);

                // Sync unread counts and seed lastMessageAt from backend
                response.data.forEach(user => {
                    if (user.unreadCount > 0) {
                        setUnreads(prev => ({ ...prev, [user._id]: user.unreadCount }));
                    }
                    if (user.lastMessageAt) {
                        seedLastMessageAt(user._id, user.lastMessageAt);
                    }
                });

                setLoading(false);
            } catch (error) {
                console.log("Error in useGetAllUsers " + error);
            }
        }
        getUsers()
    }, [setUnreads])
    return [allUsers, loading]
}

export default userGetAllUsers