"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
    const { user } = useUser();
    const { getToken } = useAuth();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    const createNewChat = async () => {
        try {
            if (!user) return null;
            const token = await getToken();
            await axios.post('/api/chat/create', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const fetchUsersChats = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/chat/get', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                if (data.data.length === 0) {
                    await createNewChat();
                    // fetch once more after creating chat
                    const { data: newData } = await axios.get('/api/chat/get', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (newData.success && newData.data.length > 0) {
                        newData.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                        setChats(newData.data);
                        setSelectedChat(newData.data[0]);
                    }
                    return;
                }

                data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                setChats(data.data);
                setSelectedChat(data.data[0]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (user) fetchUsersChats();
    }, [user]);

    const value = {
        user,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchUsersChats,
        createNewChat
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
