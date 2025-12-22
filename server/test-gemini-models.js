// Quick test to list available Gemini models
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log('Fetching available models...\n');

        // Try different model names
        const modelsToTry = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash-001',
            'gemini-1.5-flash-002',
            'gemini-pro',
            'gemini-1.5-pro',
            'models/gemini-1.5-flash',
            'models/gemini-1.5-flash-latest'
        ];

        for (const modelName of modelsToTry) {
            try {
                console.log(`Testing: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Say 'Hello'");
                const response = await result.response;
                console.log(`✅ SUCCESS: ${modelName} works!`);
                console.log(`   Response: ${response.text()}\n`);
            } catch (error) {
                console.log(`❌ FAILED: ${modelName}`);
                console.log(`   Error: ${error.message}\n`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
