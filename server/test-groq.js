// Quick test of Groq integration
import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testGroq() {
    try {
        console.log('Testing Groq API connection...\n');

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Say 'Hello from Groq!' and confirm you're working."
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 100
        });

        const response = completion.choices[0]?.message?.content || "";

        console.log('✅ SUCCESS! Groq is working!\n');
        console.log('Response:', response);
        console.log('\n📊 Model:', completion.model);
        console.log('⚡ Tokens used:', completion.usage?.total_tokens || 'N/A');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('\nPlease check:');
        console.error('1. GROQ_API_KEY is set in .env');
        console.error('2. API key is valid (starts with gsk_)');
        console.error('3. You have internet connection');
    }
}

testGroq();
