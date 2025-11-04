import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" });
    }

    await connectDB();

    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
    };

    const newChat = await Chat.create(chatData);

    // Return the created chat object so AppContext can set it as selectedChat
    return NextResponse.json({
      success: true,
      data: newChat
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
