import { useState } from 'react';
import { Sparkles, Loader, X, Check, Copy, AlertCircle } from 'lucide-react';
import axios from 'axios';

const AIAssistantModal = ({ isOpen, onClose, productName, categoryName, onApply }) => {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState(null);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const token = localStorage.getItem('token')

    const generateSuggestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${apiUrl}/ai/suggest-product-content`,
                {
                    productName,
                    categoryName
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setSuggestions(response.data.data);
        } catch (err) {
            console.error('AI Generation Error:', err);
            setError('Failed to generate suggestions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (field, value) => {
        onApply(field, value);
        // Optional: show a small toast or success indicator
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">AI Product Assistant</h2>
                            <p className="text-sm text-gray-500">Generating content for: <span className="font-semibold text-orange-600">{productName}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!suggestions && !loading && !error && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-6 animate-pulse">
                                <Sparkles size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to optimize?</h3>
                            <p className="text-gray-600 max-w-md mb-8">
                                Our AI will craft a compelling story, detailed descriptions, and SEO-friendly metadata for your product based on its name and category.
                            </p>
                            <button
                                onClick={generateSuggestions}
                                disabled={!productName}
                                className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Sparkles size={20} />
                                Generate Suggestions
                            </button>
                            {!productName && <p className="mt-4 text-sm text-red-500">Please enter a product name first.</p>}
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center py-20">
                            <Loader className="w-12 h-12 text-orange-600 animate-spin mb-4" />
                            <p className="text-gray-600 font-medium">Crafting your product's story...</p>
                            <p className="text-xs text-gray-400 mt-2">This may take a few seconds</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-100 p-6 rounded-xl flex flex-col items-center text-center">
                            <AlertCircle size={40} className="text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-red-900 mb-2">Something went wrong</h3>
                            <p className="text-red-700 mb-6">{error}</p>
                            <button
                                onClick={generateSuggestions}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {suggestions && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Short Description */}
                            <SuggestionCard
                                title="Short Description"
                                content={suggestions.shortDescription}
                                onApply={() => handleApply('shortDescription', suggestions.shortDescription)}
                            />

                            {/* Full Description */}
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Product Description</h3>
                                    <button
                                        onClick={() => handleApply('description', suggestions.fullDescription)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                                    >
                                        <Check size={16} /> Apply Sections
                                    </button>
                                </div>
                                <div className="p-6 space-y-6">
                                    {suggestions.fullDescription.map((sec, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">{sec.type}</span>
                                                <h4 className="font-bold text-gray-800 flex-1 ml-4">{sec.title}</h4>
                                            </div>
                                            {sec.type === 'list' && Array.isArray(sec.content) ? (
                                                <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm pl-2">
                                                    {sec.content.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-600 text-sm leading-relaxed">{sec.content}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cultural Story */}
                            <SuggestionCard
                                title="Cultural Story"
                                content={suggestions.culturalStory}
                                isLong
                                onApply={() => handleApply('culturalStory', suggestions.culturalStory)}
                            />

                            {/* Care Instructions */}
                            <SuggestionCard
                                title="Care Instructions"
                                content={suggestions.careInstructions}
                                onApply={() => handleApply('careInstructions', suggestions.careInstructions)}
                            />

                            {/* SEO Tags */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SuggestionCard
                                    title="Meta Title"
                                    content={suggestions.metaTitle}
                                    onApply={() => handleApply('metaTitle', suggestions.metaTitle)}
                                />
                                <SuggestionCard
                                    title="Meta Description"
                                    content={suggestions.metaDescription}
                                    onApply={() => handleApply('metaDescription', suggestions.metaDescription)}
                                />
                            </div>

                            <div className="pt-4 flex justify-center">
                                <button
                                    onClick={generateSuggestions}
                                    className="px-6 py-2 text-orange-600 font-semibold hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Sparkles size={18} /> Regenerate All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const SuggestionCard = ({ title, content, onApply, isLong = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all hover:shadow-md hover:border-orange-100 group">
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{title}</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <button
                        onClick={onApply}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                    >
                        <Check size={16} /> Apply
                    </button>
                </div>
            </div>
            <div className="p-5">
                <p className={`text-gray-600 text-sm leading-relaxed ${isLong ? 'whitespace-pre-line' : ''}`}>
                    {content}
                </p>
            </div>
        </div>
    );
};

export default AIAssistantModal;
