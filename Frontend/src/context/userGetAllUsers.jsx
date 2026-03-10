import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie"
import axios from "axios"
import useConversation from '../zustand/useConversation.js';

function userGetAllUsers() {
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false)
    const { setUnreads } = useConversation();

    useEffect(() => {
        const getUsers = async () => {
            setLoading(true)
            try {
                const token = Cookies.get("jwt");
                const response = await axios.get("/api/users/allusers", {
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setAllUsers(response.data);

                // Sync unread counts for Feature 13
                const initialUnreads = {};
                response.data.forEach(user => {
                    if (user.unreadCount > 0) {
                        initialUnreads[user._id] = user.unreadCount;
                    }
                });
                setUnreads(initialUnreads);

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