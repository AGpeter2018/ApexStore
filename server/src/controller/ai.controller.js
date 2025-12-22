import Groq from "groq-sdk";
import Product from '../../models/Product.model.js';
import Category from '../../models/Category.model.js';
import Order from '../../models/Order.model.js';
import Vendor from '../../models/Vendor.js';

// Lazy initialization of Groq client
const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is missing from environment variables");
    }
    return new Groq({ apiKey });
};

export const generateProductSuggestions = async (req, res) => {
    try {
        const { productName, categoryName } = req.body;

        if (!productName) {
            return res.status(400).json({
                success: false,
                message: "Product name is required"
            });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("AI Assistant Error: GROQ_API_KEY is missing from environment.");
            return res.status(500).json({
                success: false,
                message: "AI service is not configured (missing API key)."
            });
        }

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

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 2000
        });

        const text = completion.choices[0]?.message?.content || "";

        // Extract JSON from the response text
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

const searchCache = new Map();

export const expandSearchQuery = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        // Check Cache
        const cacheKey = query.toLowerCase().trim();
        if (searchCache.has(cacheKey)) {
            return res.status(200).json({
                success: true,
                data: searchCache.get(cacheKey)
            });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: "AI service not configured"
            });
        }

        const prompt = `
            You are an AI search specialist for "ApexStore", an African e-commerce marketplace.
            Analyze the following user search query: "${query}"
            
            Identify:
            1. The core intent (what are they looking for?).
            2. Expanded keywords (synonyms, related cultural terms, specific product types).
            3. Likely categories.
            4. Suggested price range (if implied, e.g., "luxury" or "affordable").

            Format the response ONLY as a JSON object:
            {
                "originalQuery": "${query}",
                "intent": "...",
                "expandedTerms": ["term1", "term2", ...],
                "categories": ["category1", ...],
                "suggestedMaxPrice": number or null,
                "suggestedMinPrice": number or null
            }
        `;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 500
        });

        const text = completion.choices[0]?.message?.content || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const suggestions = JSON.parse(jsonMatch ? jsonMatch[0] : text);

        // Save to cache
        searchCache.set(cacheKey, suggestions);

        res.status(200).json({
            success: true,
            data: suggestions
        });

    } catch (error) {
        console.error("AI Search Expansion Error:", error);
        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: "AI High demand. Please try regular search.",
                isQuotaExceeded: true
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to expand search query",
            error: error.message
        });
    }
};

export const getAIRecommendations = async (req, res) => {
    try {
        const { productId } = req.params;

        const currentProduct = await Product.findById(productId).populate('categoryId');
        if (!currentProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let pairingSuggestions = currentProduct.aiPairingIntents || [];

        // If no cached intents, call Groq
        if (pairingSuggestions.length === 0) {
            const apiKey = process.env.GROQ_API_KEY;

            const prompt = `
                Analyze the product: "${currentProduct.name}"
                Category: "${currentProduct.categoryId?.name}"
                Short Description: "${currentProduct.shortDescription}"

                Identify 3 complementary product categories or specific items that would "pair well" with this.
                Return ONLY a JSON array of strings: ["Pairing 1", "Pairing 2", "Pairing 3"]
            `;

            const completion = await getGroqClient().chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.6,
                max_tokens: 200
            });

            const text = completion.choices[0]?.message?.content || "";
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            pairingSuggestions = JSON.parse(jsonMatch ? jsonMatch[0] : text);

            // Cache the results back to the product
            currentProduct.aiPairingIntents = pairingSuggestions;
            await currentProduct.save();
        }

        // Fetch actual products matching these categories/names
        const recommendedProducts = await Product.find({
            _id: { $ne: productId },
            isActive: true,
            $or: pairingSuggestions.map(term => ({
                $or: [
                    { name: { $regex: term, $options: 'i' } },
                    { tags: { $in: [new RegExp(term, 'i')] } }
                ]
            }))
        })
            .limit(4)
            .populate('categoryId', 'name')
            .lean();

        res.status(200).json({
            success: true,
            pairingIntents: pairingSuggestions,
            data: recommendedProducts
        });

    } catch (error) {
        console.error("AI Recommendations Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch AI recommendations",
            error: error.message
        });
    }
};

const vendorCache = new Map();
const adminCache = { data: null, lastFetched: 0 };

export const getVendorAIInsights = async (req, res) => {
    try {
        const { vendorId } = req.params;

        // Check Cache (1 hour)
        const cacheEntry = vendorCache.get(vendorId);
        if (cacheEntry && Date.now() - cacheEntry.timestamp < 3600000) {
            return res.status(200).json({ success: true, data: cacheEntry.data });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

        const mostViewed = await Product.find({ vendorId }).sort({ viewsCount: -1 }).limit(5).select('name viewsCount stockQuantity');
        const lowStock = await Product.find({ vendorId, stockQuantity: { $lt: 5 }, isActive: true }).select('name stockQuantity');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentOrders = await Order.find({ "items.vendor": vendor.owner, createdAt: { $gte: thirtyDaysAgo } });

        const summary = {
            storeName: vendor.storeName,
            totalSales: vendor.totalSales,
            recentVolume: recentOrders.length,
            popular: mostViewed.map(p => `${p.name} (${p.viewsCount} views)`),
            lowStock: lowStock.map(p => p.name)
        };

        const prompt = `
            Analyze store performance for "${summary.storeName}":
            - Recent 30-day orders: ${summary.recentVolume}
            - Popular items: ${summary.popular.join(", ")}
            - Low stock: ${summary.lowStock.join(", ") || "None"}

            Provide 3 business growth insights in JSON format:
            [{"type": "stock"|"marketing"|"trend", "title": "...", "content": "..."}]
        `;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 800
        });

        const text = completion.choices[0]?.message?.content || "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const insights = JSON.parse(jsonMatch ? jsonMatch[0] : text);

        // Save to cache
        vendorCache.set(vendorId, { data: insights, timestamp: Date.now() });

        res.status(200).json({ success: true, data: insights });
    } catch (error) {
        console.error("Vendor AI Insights Error:", error);
        if (error.status === 429) {
            return res.status(429).json({ success: false, message: "AI Quota exceeded. Using local metrics only." });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const handleCustomerChat = async (req, res) => {
    try {
        const { message, history = [], context = {} } = req.body;

        const apiKey = process.env.GROQ_API_KEY;

        const systemPrompt = `
            You are "Apex Assistant", a friendly shopping guide for ApexStore, which specializes in authentic African products.
            Context: The user is currently looking at ${context.page || "the homepage"}. 
            Product in focus: ${context.productName || "None"}.
            
            Be helpful, culturally respectful, and suggest products from the catalog when relevant.
            Keep responses concise (max 3-4 sentences unless explaining history).
        `;

        // Format history for Groq
        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map(h => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.content
            })),
            { role: "user", content: message }
        ];

        const completion = await getGroqClient().chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.8,
            max_tokens: 500
        });

        const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";

        res.status(200).json({
            success: true,
            reply
        });

    } catch (error) {
        console.error("AI Chat Error:", error);
        if (error.status === 429) {
            return res.status(429).json({ success: false, message: "Quota exceeded. Please try again later." });
        }
        res.status(500).json({ success: false, message: "Chat error", error: error.message });
    }
};

export const getAdminAIInsights = async (req, res) => {
    try {
        // Check Cache (1 hour)
        if (adminCache.data && Date.now() - adminCache.lastFetched < 3600000) {
            return res.status(200).json({ success: true, data: adminCache.data });
        }

        // Collect cross-platform stats
        const [
            totalProducts,
            activeProducts,
            outOfStock,
            lowStockCount,
            totalInventoryValueResult,
            categoryStats,
            vendorStats
        ] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ status: 'active', isActive: true }),
            Product.countDocuments({ stockQuantity: 0 }),
            Product.countDocuments({
                $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
                stockQuantity: { $gt: 0 }
            }),
            Product.aggregate([{ $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stockQuantity'] } } } }]),
            Product.aggregate([
                { $group: { _id: '$categoryId', count: { $sum: 1 } } },
                { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
                { $unwind: '$cat' },
                { $project: { name: '$cat.name', count: 1 } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]),
            Product.aggregate([
                { $group: { _id: '$vendorId', count: { $sum: 1 }, value: { $sum: { $multiply: ['$price', '$stockQuantity'] } } } },
                { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'v' } },
                { $unwind: '$v' },
                { $project: { name: '$v.storeName', count: 1, value: 1 } },
                { $sort: { value: -1 } },
                { $limit: 3 }
            ])
        ]);

        const summary = {
            totalProducts,
            activeProducts,
            outOfStock,
            lowStockCount,
            totalInventoryValue: totalInventoryValueResult[0]?.total || 0,
            topCategories: categoryStats.map(c => `${c.name} (${c.count} items)`),
            topVendors: vendorStats.map(v => `${v.name} (Value: ₦${v.value})`)
        };

        const prompt = `
            You are 'Apex Market Strategist', an AI analyst for the ApexStore administrator. Your goal is to provide high-level, data-driven strategic advice.
            
            Marketplace Overview:
            - Total Active Products: ${summary.activeProducts} / ${summary.totalProducts}
            - Inventory Health: ${summary.outOfStock} out of stock, ${summary.lowStockCount} low stock.
            - Total Asset Value: ₦${summary.totalInventoryValue}
            - Dominant Categories: ${summary.topCategories.join(", ")}
            - Top Vendors: ${summary.topVendors.join(", ")}

            Based on this data, provide 3 strategic growth recommendations in JSON format:
            [{"type": "expansion"|"inventory"|"marketing", "title": "...", "content": "..."}]
            Keep insights professional, data-driven, and focused on platform growth.
        `;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1000
        });

        const text = completion.choices[0]?.message?.content || "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const insights = JSON.parse(jsonMatch ? jsonMatch[0] : text);

        // Save to cache
        adminCache.data = insights;
        adminCache.lastFetched = Date.now();

        res.status(200).json({ success: true, data: insights });
    } catch (error) {
        console.error("Admin AI Insights Error:", error);
        if (error.status === 429) {
            return res.status(429).json({ success: false, message: "AI Rate limit reached. Showing platform stats only." });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};
