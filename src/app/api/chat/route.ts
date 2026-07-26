import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { products as defaultProducts, mapDbToProduct, formatINR } from "@/lib/products";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in environment variables." },
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

    // Fetch live catalog from Supabase or fallback to static catalog
    let catalog = defaultProducts;
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { data } = await supabase.from("products").select("*").order("id", { ascending: true });
      if (data && data.length > 0) {
        catalog = data.map(mapDbToProduct);
      }
    } catch (dbError) {
      console.warn("Could not fetch database catalog for AI, falling back to static catalog:", dbError);
    }

    // Build rich product context for Gemini
    const catalogContext = catalog
      .map(
        (p) =>
          `- Title: "${p.title}" (Link: /shop/${p.slug}) | Price: ${formatINR(p.price)} | Subtitle: "${p.subtitle}" | Fabric: ${p.fabric} | Sizes: ${p.sizes.join(", ")} | Colors: ${p.colors.map((c) => c.name).join(", ")} | Description: ${p.description}`
      )
      .join("\n");

    const systemInstruction = `You are "M Chat", an AI shopping assistant for Modestus, a luxury modest fashion house.
Your tone is sophisticated, polite, elegant, warm, and highly knowledgeable about modest apparel.

Live Modestus Product Catalog:
${catalogContext}

Guidelines:
1. Recommend outfits and garments exclusively from our live Modestus catalog above.
2. Whenever you mention a product, state its exact title and price in INR (e.g., ₹8,500).
3. Provide styling ideas, occasion advice (formal gatherings, luxury vacations, daily wear), and fabric/sizing guidance.
4. When recommending any product, always provide a clickable markdown link in the format: [Product Title](/shop/product-slug) so the user can easily view and purchase it.
5. If asked about store policies: we offer worldwide priority shipping, complimentary gift wrapping, and seamless 7-day VIP returns.
6. Format your responses with clean markdown (bullet points, bold text) for easy scannability. Keep your advice refined and inspiring.`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it",
      contents: messages,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: unknown) {
    console.error("Gemini AI Stylist Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to communicate with AI Stylist";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
