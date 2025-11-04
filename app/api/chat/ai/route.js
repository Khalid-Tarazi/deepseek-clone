import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { chatId, prompt } = await req.json();
    if (!chatId || !prompt) {
      return NextResponse.json({ success: false, message: "chatId & prompt required" }, { status: 400 });
    }

    await connectDB();
    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return NextResponse.json({ success: false, message: "Chat not found" }, { status: 404 });
    }

    // Save user message
    const userMessage = { role: "user", content: prompt, timestamp: Date.now() };
    chat.messages.push(userMessage);

    // ✅ DeepSeek via OpenRouter
    const completion = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: chat.messages,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://deepseek-clone-jet.vercel.app/", 
          "X-Title": "DeepSeek Clone",
        },
      }
    );

    const aiMessage = completion.data.choices?.[0]?.message;
    if (!aiMessage) {
      return NextResponse.json({ success: false, message: "No response from AI" });
    }

    aiMessage.timestamp = Date.now();
    chat.messages.push(aiMessage);

    await chat.save();

    return NextResponse.json({ success: true, data: aiMessage });

  } catch (error) {
    console.error("DeepSeek Route Error:", error.response?.data || error.message);

    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
