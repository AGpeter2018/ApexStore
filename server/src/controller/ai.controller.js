import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateProductSuggestions = async (req, res) => {
    try {
        const { productName, categoryName } = req.body;

        if (!productName) {
            return res.status(400).json({
                success: false,
                message: "Product name is required"
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("AI Assistant Error: GEMINI_API_KEY is missing from environment.");
            return res.status(500).json({
                success: false,
                message: "AI service is not configured (missing API key)."
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are an expert e-commerce product specialist for "ApexStore", a marketplace focusing on high-quality African products, including cultural artifacts, clothing, and home decor.
            
            Based on the product name: "${productName}" and category: "${categoryName || 'General'}", please generate:
            1. A compelling "Short Description" (max 200 characters).
            2. A detailed "Full Description" structured as three sections: "About the Product", "Key Features", and "Why You'll Love It".
            3. A "Cultural Story" (approx 200-300 words) that connects the product to African heritage, craftsmanship, or modern lifestyle.
            4. "Care Instructions" (max 500 characters) on how to maintain the product.
            5. SEO Metadata: A "Meta Title" (max 60 characters) and "Meta Description" (max 160 characters).

            Format the response as a JSON object with the following keys:
            shortDescription,
            fullDescription (this should be an array of objects: [{type: 'text', title: 'About the Product', content: '...'}, {type: 'list', title: 'Key Features', content: ['...', '...']}, {type: 'text', title: "Why You'll Love It", content: '...'}]),
            culturalStory,
            careInstructions,
            metaTitle,
            metaDescription

            Ensure the JSON is valid and only return the JSON object.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response text (just in case there's markdown wrapping)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;

        try {
            const suggestions = JSON.parse(jsonString);
            res.status(200).json({
                success: true,
                data: suggestions
            });
        } catch (parseError) {
            console.error("AI JSON Parse Error:", parseError, "Original text:", text);
            res.status(500).json({
                success: false,
                message: "Failed to parse AI response. Please try again.",
                error: text
            });
        }

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate AI suggestions",
            error: error.message
        });
    }
};
