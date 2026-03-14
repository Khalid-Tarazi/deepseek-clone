"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
    const { user, isLoaded } = useUser(); // Add isLoaded
    const { getToken } = useAuth();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatsLoaded, setChatsLoaded] = useState(false);

    const clearChatData = () => {
        setChats([]);
        setSelectedChat(null);
        setChatsLoaded(false);
    };

    const createNewChat = async () => {
        try {
            if (!user) return null;

            const token = await getToken();

            const { data } = await axios.post('/api/chat/create', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.data) {
                setChats(prev => [data.data, ...prev]);
                setSelectedChat(data.data);
                return data.data;
            }

        } catch (error) {
            toast.error(error.message);
            return null;
        }
    };

    const fetchUsersChats = async () => {
        try {
            if (!user) return null;

            const token = await getToken();
            const { data } = await axios.get('/api/chat/get', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setChatsLoaded(true);
                
                if (!data.data || data.data.length === 0) {
                    const newChat = await createNewChat();
                    return newChat;
                }

                const sortedChats = data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                setChats(sortedChats);

                if (!selectedChat) {
                    setSelectedChat(sortedChats[0]);
                    return sortedChats[0];
                }

                return sortedChats[0];
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            return null;
        }
    };

    // Clear chat data when user logs out
    useEffect(() => {
        if (isLoaded && !user) {
            // User has signed out
            clearChatData();
        }
    }, [user, isLoaded]);

    // Fetch chats when user is loaded and authenticated
    useEffect(() => {
        if (isLoaded && user && !chatsLoaded) {
            fetchUsersChats();
        }
    }, [user, isLoaded, chatsLoaded]);

    useEffect(() => {
    if (!user && chats.length > 0) {
        // User logged out - clear all chat data
        setChats([]);
        setSelectedChat(null);
        setChatsLoaded(false);
    }
}, [user]);

    const value = {
        user,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchUsersChats,
        createNewChat,
        chatsLoaded,
        clearChatData
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};