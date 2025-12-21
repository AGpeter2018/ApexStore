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

console.log("Using API Key:", apiKey.substring(0, 5) + "...");

const genAI = new GoogleGenerativeAI(apiKey);

async function testAI() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = "Generate a short JSON object for a product 'African Drum'. {name, description}";

        console.log("Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Response text:");
        console.log(text);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;

        try {
            const json = JSON.parse(jsonString);
            console.log("Successfully parsed JSON:", json);
        } catch (e) {
            console.error("Failed to parse JSON:", e.message);
        }

    } catch (error) {
        console.error("AI Generation Error:");
        console.error(error);
    }
}

testAI();
