import { assets } from "@/assets/assets";
import Image from "next/image";
import React, { useState } from "react";
import { UserButton, useClerk } from "@clerk/nextjs";
import { useAppContext } from "@/context/AppContext";
import ChatLabel from "./ChatLabel";

const Sidebar = ({ expand, setExpand }) => {
    const { user, chats, createNewChat } = useAppContext();
    const { openSignIn } = useClerk();
    const [openMenu, setOpenMenu] = useState({ id: 0, open: false });

    const handleNewChat = async () => {
        const newChat = await createNewChat();
        if (!expand) setExpand(true);
    };

    return (
        <div className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all max-md:absolute max-md:h-screen z-20 ${expand ? "p-4 w-64" : "md:w-20 w-0 max-md:overflow-hidden"}`}>

            {/* Top Logo Row */}
            <div className="flex-1 overflow-hidden">
                <div className={`flex ${expand ? "flex-row gap-10" : "flex-col items-center gap-8"}`}>
                    <Image className={expand ? "w-36" : "w-10"} src={expand ? assets.logo_text : assets.logo_icon} alt="" />

                    <div onClick={() => setExpand(!expand)}
                        className="group flex items-center justify-center hover:bg-gray-500/20 h-9 w-9 rounded-lg cursor-pointer transition-colors">
                        <Image src={expand ? assets.sidebar_close_icon : assets.sidebar_icon} alt="" className="w-7" />
                    </div>
                </div>

                {/* New Chat Button */}
                <button onClick={handleNewChat}
                    className={`mt-8 flex items-center justify-center transition-all cursor-pointer ${expand ? "bg-primary rounded-2xl gap-2 p-2.5 w-max hover:bg-primary/90" : "group h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg"}`}>
                    <Image className={expand ? "w-6" : "w-7"} src={assets.chat_icon} alt="" />
                    {expand && <p className="text-white font-medium">New Chat</p>}
                </button>

                {/* Recent Chats - ONLY ONE "Recents" heading */}
                {expand && (
                    <div className="mt-8 text-white/25 text-sm">
                        {/* Only one Recents heading here */}
                        <p className="my-1">Recents</p>
                        <div className="space-y-1" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                            {chats.map(chat => (
                                <ChatLabel
                                    key={chat._id}
                                    id={chat._id}
                                    name={chat.name}
                                    openMenu={openMenu}
                                    setOpenMenu={setOpenMenu}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom User Section */}
            <div className="flex-shrink-0">
                <div className="flex items-center gap-3 text-white/60 text-sm p-2 mt-2 cursor-pointer hover:bg-white/10 rounded-lg transition-colors">
                    {user ? <UserButton /> : <Image className="w-7 cursor-pointer" src={assets.profile_icon} alt="" onClick={openSignIn} />}
                    {expand && <span>My Profile</span>}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;