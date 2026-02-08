import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const groqKey = process.env.GROQ_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

async function testGroq() {
    console.log("\n--- Testing Groq ---");
    if (!groqKey) {
        console.error("GROQ_API_KEY is missing");
        return;
    }
    try {
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say hello" }],
            model: "llama-3.3-70b-versatile",
        });
        console.log("Groq Success:", completion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Groq Failure:", error.message);
    }
}

async function testGemini() {
    console.log("\n--- Testing Gemini ---");
    if (!geminiKey) {
        console.error("GEMINI_API_KEY is missing");
        return;
    }
    try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log("Gemini Success:", response.text());
    } catch (error) {
        console.error("Gemini Failure:", error.message);
    }
}

async function runTests() {
    await testGroq();
    await testGemini();
}

runTests();
