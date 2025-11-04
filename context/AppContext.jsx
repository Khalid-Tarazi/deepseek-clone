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

    // Create a new chat
    const createNewChat = async () => {
        try {
            if (!user) return null;

            const token = await getToken();

            const { data } = await axios.post('/api/chat/create', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.data) {
                // Add the new chat to state and select it
                setChats(prev => [data.data, ...prev]);
                setSelectedChat(data.data);
                return data.data;
            }

        } catch (error) {
            toast.error(error.message);
            return null;
        }
    };

    // Fetch all chats for the user
    const fetchUsersChats = async () => {
        try {
            if (!user) return null;

            const token = await getToken();
            const { data } = await axios.get('/api/chat/get', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                // No chats? Create one
                if (!data.data || data.data.length === 0) {
                    const newChat = await createNewChat();
                    return newChat; // return the first chat
                }

                // Sort chats by updatedAt
                const sortedChats = data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                setChats(sortedChats);

                // Set the first chat as selected if none selected yet
                if (!selectedChat) setSelectedChat(sortedChats[0]);

                return sortedChats[0]; // return first chat
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

    useEffect(() => {
        if (user) {
            fetchUsersChats();
        }
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