import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie"
import axios from "axios"

function useGetGroups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getGroups = async () => {
            setLoading(true)
            try {
                const token = Cookies.get("jwt");
                const response = await axios.get("/api/users/allgroups", {
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setGroups(response.data);
                setLoading(false);
            } catch (error) {
                console.log("Error in useGetGroups " + error);
                setLoading(false);
            }
        }
        getGroups()
    }, [])
    return [groups, loading]
}

export default useGetGroups
