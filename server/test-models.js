import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("ERROR: GEMINI_API_KEY is not defined in .env file");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Note: The JS SDK might not have a direct listModels method on the genAI instance 
        // that works the same way as the python one without the management service.
        // But we can try a basic generation with 'gemini-pro' as a fallback.

        console.log("Testing with 'gemini-1.5-flash' again...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Hi");
            console.log("gemini-1.5-flash works!");
        } catch (e) {
            console.log("gemini-1.5-flash failed:", e.message);
        }

        console.log("Testing with 'gemini-pro'...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hi");
            console.log("gemini-pro works!");
        } catch (e) {
            console.log("gemini-pro failed:", e.message);
        }

        console.log("Testing with 'gemini-1.5-pro'...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await model.generateContent("Hi");
            console.log("gemini-1.5-pro works!");
        } catch (e) {
            console.log("gemini-1.5-pro failed:", e.message);
        }

    } catch (error) {
        console.error("Error during listing:", error);
    }
}

listModels();
