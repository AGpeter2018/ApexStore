// Test Gemini 2.0 and other available models
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
    const modelsToTry = [
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash',
        'gemini-exp-1206',
        'gemini-exp-1121',
        'learnlm-1.5-pro-experimental'
    ];

    console.log('Testing Gemini 2.0 and experimental models...\n');

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
}

testModels();
