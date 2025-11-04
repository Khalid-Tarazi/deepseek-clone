import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const PromptBox = ({ setIsLoading, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const { user, chats, setChats, selectedChat, setSelectedChat, fetchUsersChats, createNewChat } = useAppContext();
    const [chatReady, setChatReady] = useState(false);

    // Initialize chat when component mounts or user changes
    useEffect(() => {
        const initializeChat = async () => {
            if (!user) return;

            let chat = selectedChat;

            // Fetch chats if none
            if (!chat) {
                chat = await fetchUsersChats(); // fetch first chat
            }

            // Create new chat if still none
            if (!chat) {
                chat = await createNewChat();
            }

            if (chat) {
                setSelectedChat(chat);
                setChatReady(true);
            }
        };

        initializeChat();
    }, [user]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendPrompt(e);
        }
    };

    const sendPrompt = async (e) => {
        e.preventDefault();

        if (!user) return toast.error('Login to send message');
        if (!selectedChat) return toast.error('No chat selected');
        if (isLoading) return toast.error('Wait for the previous prompt response');

        const promptCopy = prompt;
        setIsLoading(true);
        setPrompt("");

        const userPrompt = {
            role: "user",
            content: prompt,
            timestamp: Date.now(),
        };

        // Update chats and selectedChat with user message
        setChats(prevChats => prevChats.map(chat =>
            chat._id === selectedChat._id
                ? { ...chat, messages: [...chat.messages, userPrompt] }
                : chat
        ));
        setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, userPrompt] } : prev);

        try {
            const { data } = await axios.post('/api/chat/ai', {
                chatId: selectedChat._id,
                prompt
            });

            if (!data.success) {
                toast.error(data.message);
                setPrompt(promptCopy);
                return;
            }

            const aiMessageContent = data.data.content || "No response";
            const messageTokens = aiMessageContent.split(" ");
            const assistantMessage = {
                role: 'assistant',
                content: "",
                timestamp: Date.now(),
            };

            setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, assistantMessage] } : prev);

            // Typing animation
            messageTokens.forEach((_, i) => {
                setTimeout(() => {
                    setSelectedChat(prev => {
                        if (!prev) return prev;
                        const updatedMessage = {
                            ...assistantMessage,
                            content: messageTokens.slice(0, i + 1).join(" ")
                        };
                        return {
                            ...prev,
                            messages: [...prev.messages.slice(0, -1), updatedMessage]
                        };
                    });
                }, i * 100);
            });

            // Update chats array with final AI message
            setChats(prevChats => prevChats.map(chat =>
                chat._id === selectedChat._id
                    ? { ...chat, messages: [...chat.messages, { ...assistantMessage, content: aiMessageContent }] }
                    : chat
            ));

        } catch (error) {
            toast.error(error.message);
            setPrompt(promptCopy);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={sendPrompt}
            className={`w-full ${selectedChat?.messages?.length > 0 ? "max-w-3xl" : "max-w-2xl"} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
        >
            <textarea
                onKeyDown={handleKeyDown}
                className='outline-none w-full resize-none overflow-hidden break-words bg-transparent'
                rows={2}
                placeholder={chatReady ? 'Message DeepSeek' : 'Loading chat...'}
                required
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
            />
            <div className='flex items-center justify-between text-sm mt-2'>
                <div className="flex items-center gap-2">
                    <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
                        <Image className='h-5' src={assets.deepthink_icon} alt='' />
                        DeepThink (R1)
                    </p>
                    <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
                        <Image className='h-5' src={assets.search_icon} alt='' />
                        Search
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Image className='w-4 cursor-pointer' src={assets.pin_icon} alt='' />
                    <button type="submit" className={`${prompt ? "bg-primary" : "bg-[#71717a]"} rounded-full p-2 cursor-pointer`}>
                        <Image className='w-3.5 aspect-square' src={prompt ? assets.arrow_icon : assets.arrow_icon_dull} alt='' />
                    </button>
                </div>
            </div>
        </form>
    );
};

export default PromptBox;