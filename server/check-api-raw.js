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

// Node 18+ has global fetch
async function checkApiKey() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        console.log("Fetching models list from raw API...");
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log("API Key is VALID.");
            console.log("Available models:");
            console.log(data.models.map(m => m.name));
        } else {
            console.error("API Key check FAILED:");
            console.error("Status:", response.status);
            console.error("Data:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Fetch error:", error.message);
    }
}

checkApiKey();
