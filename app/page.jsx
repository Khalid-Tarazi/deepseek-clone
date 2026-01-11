'use client';
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import PromptBox from "@/components/PromptBox";
import Sidebar from "@/components/Sidebar";
import Message from "@/components/Message";
import { useAppContext } from "@/context/AppContext";
import { useClerk } from "@clerk/nextjs"; // Import useClerk

export default function Home() {
  const [expand, setExpand] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedChat, user } = useAppContext();
  const { openSignIn } = useClerk(); // Get openSignIn function
  const containerRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Show loading or sign in message if no user
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#292a2d] text-white">
        <div className="text-center">
          <Image src={assets.logo_icon} alt="DeepSeek" className="h-20 w-20 mx-auto mb-4" />
          <h1 className="text-2xl font-medium mb-2">Welcome to DeepSeek Clone</h1>
          <p className="text-gray-400 mb-6">Please sign in to start chatting</p>
          {/* Add Sign In Button */}
          <button
            onClick={() => openSignIn()}
            className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-screen">
        <Sidebar expand={expand} setExpand={setExpand} />

        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 bg-[#292a2d] text-white relative">
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            <Image 
              onClick={() => (expand ? setExpand(false) : setExpand(true))}
              className="rotate-180" 
              src={assets.menu_icon} 
              alt="Menu" 
            />
            <Image className="opacity-70" src={assets.chat_icon} alt="Chat" />
          </div>

          {messages.length === 0 ? (
            <>
              <div className="flex items-center gap-3">
                <Image src={assets.logo_icon} alt="DeepSeek" className="h-16" />
                <p className="text-2xl font-medium">Hi, I am DeepSeek.</p>
              </div>
              <p className="text-sm mt-2">How can I help you today?</p>
            </>
          ) : (
            <div 
              ref={containerRef}
              className="relative flex flex-col items-center justify-start w-full mt-20 max-h-screen overflow-y-auto"
            >
              <p className="fixed top-8 border border-transparent hover:border-gray-500/50 py-1 rounded-lg font-semibold mb-6">
                {selectedChat?.name || "Chat"}
              </p>
              {messages.map((msg, index) => (
                <Message key={index} role={msg.role} content={msg.content} />
              ))}
              {isLoading && (
                <div className="flex gap-4 max-w-3xl w-full py-3">
                  <Image 
                    className="h-9 w-9 p-1 border border-white/15 rounded-full"
                    src={assets.logo_icon} 
                    alt="Logo" 
                  />
                  <div className="loader flex justify-center items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                    <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                    <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                  </div>
                </div>
              )}
            </div>
          )}
          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
          <p className="text-xs absolute bottom-1 text-gray-500">AI-generated, for reference only</p>
        </div>
      </div>
    </div>
  );
}