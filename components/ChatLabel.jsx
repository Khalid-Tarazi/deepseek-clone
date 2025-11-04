import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import Image from 'next/image';
import React, { useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const ChatLabel = ({ openMenu, setOpenMenu, id, name }) => {
    const { fetchUsersChats, chats, setSelectedChat } = useAppContext();
    const dropdownRef = useRef();
    const menuButtonRef = useRef();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
                setOpenMenu({ id: 0, open: false });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setOpenMenu]);

    // Select chat when clicked
    const selectChat = () => {
        const chatData = chats.find(chat => chat._id === id);
        setSelectedChat(chatData);
        console.log(chatData);
    };

    // Rename chat
    const renameHandler = async () => {
        try {
            const newName = prompt('Enter new name');
            if (!newName) return;

            const { data } = await axios.post('/api/chat/rename', { chatId: id, name: newName });

            if (data.success) {
                fetchUsersChats();
                setOpenMenu({ id: 0, open: false });
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Delete chat
    const deleteHandler = async () => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this chat?');
            if (!confirmDelete) return;

            const { data } = await axios.post('/api/chat/delete', { chatId: id });

            if (data.success) {
                fetchUsersChats();
                setOpenMenu({ id: 0, open: false });
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div
            onClick={selectChat}
            className='flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer relative'
        >
            <p className='group-hover:max-w-5/6 truncate flex-1'>{name}</p>

            <div
                ref={menuButtonRef}
                onClick={e => {
                    e.stopPropagation();
                    setOpenMenu({
                        id: id,
                        open: !openMenu.open
                    });
                }}
                className="flex items-center justify-center h-6 w-6 aspect-square hover:bg-black/80 rounded-lg transition-colors cursor-pointer relative"
            >
                <Image
                    src={assets.three_dots}
                    alt='Menu'
                    className={`w-4 ${openMenu.id === id && openMenu.open ? 'block' : 'hidden group-hover:block'}`}
                />
            </div>

            {/* Dropdown Menu - Rendered outside the scroll container */}
            {openMenu.id === id && openMenu.open && (
                <div
                    ref={dropdownRef}
                    className="fixed bg-gray-700 rounded-xl w-32 p-2 z-50 shadow-lg border border-gray-600"
                    style={{
                        top: `${menuButtonRef.current?.getBoundingClientRect().bottom + 5}px`,
                        left: `${menuButtonRef.current?.getBoundingClientRect().left - 120}px`
                    }}
                >
                    <div
                        onClick={renameHandler}
                        className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                        <Image src={assets.pencil_icon} alt='Rename' className='w-4' />
                        <p className="text-sm">Rename</p>
                    </div>

                    <div
                        onClick={deleteHandler}
                        className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                        <Image src={assets.delete_icon} alt='Delete' className='w-4' />
                        <p className="text-sm">Delete</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatLabel;