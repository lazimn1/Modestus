import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "N8N_WEBHOOK_URL is not configured in environment variables." },
        { status: 500 }
      );
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid conversation messages payload." },
        { status: 400 }
      );
    }

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1];

    // Forward the message to the n8n webhook
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        latestMessageText: latestMessage?.parts?.[0]?.text || "",
      }),
    });

    if (!res.ok) {
      throw new Error(`n8n webhook responded with status: ${res.status}`);
    }

    const data = await res.json();
    
    // We expect the n8n workflow to return a JSON object with a 'reply' field
    // e.g. { "reply": "Hello from n8n!" }
    return NextResponse.json({ reply: data.reply || "No reply from workflow." });

  } catch (error: unknown) {
    console.error("n8n Chat Integration Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to communicate with n8n";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
