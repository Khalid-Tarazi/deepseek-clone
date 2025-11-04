import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY
});

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" });
    }

    const { chatId, prompt } = await req.json();
    await connectDB();

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return NextResponse.json({ success: false, message: "Chat not found" });

    // Add user message to chat
    const userMessage = { role: "user", content: prompt, timestamp: Date.now() };
    chat.messages.push(userMessage);

    // Call Google Gemini API
    const completion = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: chat.messages.map(msg => ({ role: msg.role, content: msg.content })),
      store: true
    });

    const aiMessage = completion.choices[0].message;
    aiMessage.timestamp = Date.now();
    chat.messages.push(aiMessage);

    await chat.save();

    return NextResponse.json({ success: true, data: aiMessage });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
