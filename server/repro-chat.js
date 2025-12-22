import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function testChat() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("No API key found in .env");
            return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const context = { page: "homepage" };
        const systemPrompt = `
            You are "Apex Assistant", a friendly shopping guide for ApexStore, which specializes in authentic African products.
            Context: The user is currently looking at ${context.page || "the homepage"}. 
            Product in focus: ${context.productName || "None"}.
            
            Be helpful, culturally respectful, and suggest products from the catalog when relevant.
            Keep responses concise (max 3-4 sentences unless explaining history).
        `;

        // The correct way in newer SDKs is systemInstruction
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt
        });

        const message = "Hi, I'm looking for a drum.";
        const history = [];

        console.log("Starting chat...");
        const chat = model.startChat({
            history: history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
            generationConfig: { maxOutputTokens: 500 }
        });

        console.log("Sending message...");
        const result = await chat.sendMessage(message);

        console.log("Success! Reply:", result.response.text());

    } catch (error) {
        console.error("Chat Test Failed!");
        console.error("Error Message:", error.message);
        console.error("Stack:", error.stack);
    }
}

testChat();
