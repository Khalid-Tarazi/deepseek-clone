import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"; 

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" });
    }

    if (!chatId) {
      return NextResponse.json({ success: false, message: "Chat ID is required" });
    }

    // Connect to the database and delete the chat
    await connectDB();
    const deletedChat = await Chat.deleteOne({ _id: chatId, userId });

    if (deletedChat.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Chat not found or not authorized" });
    }

    return NextResponse.json({ success: true, message: "Chat deleted successfully" });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
