import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, Layers, Star } from 'lucide-react';

const CollectionsListPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [selectedCollections, setSelectedCollections] = useState([]);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/collections`);
            setCollections(data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch collections');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/collections/${id}`);
            setCollections(collections.filter(c => c._id !== id));
            setDeleteConfirm(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete collection');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedCollections.length === 0) return;
        
        if (confirm(`Delete ${selectedCollections.length} collection(s)?`)) {
            try {
                await Promise.all(
                    selectedCollections.map(id => 
                        axios.delete(`${import.meta.env.VITE_API_URL}/collections/${id}`)
                    )
                );
                setCollections(collections.filter(c => !selectedCollections.includes(c._id)));
                setSelectedCollections([]);
            } catch (error) {
                alert('Failed to delete some collections');
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedCollections.length === collections.length) {
            setSelectedCollections([]);
        } else {
            setSelectedCollections(collections.map(c => c._id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedCollections(prev => 
            prev.includes(id) 
                ? prev.filter(cId => cId !== id)
                : [...prev, id]
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Collections</h1>
                        <p className="text-gray-600 mt-2">Organize your products into collections</p>
                    </div>
                    <Link
                        to="/admin/add-collection"
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Collection
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Bulk Actions */}
                {selectedCollections.length > 0 && (
                    <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6 flex justify-between items-center">
                        <span className="text-orange-800 font-semibold">
                            {selectedCollections.length} collection(s) selected
                        </span>
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Delete Selected
                        </button>
                    </div>
                )}

                {/* Collections Grid */}
                {collections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map((collection) => (
                            <div key={collection._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="relative">
                                    {/* Checkbox */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedCollections.includes(collection._id)}
                                            onChange={() => toggleSelect(collection._id)}
                                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                        />
                                    </div>

                                    {/* Image */}
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={collection.collectionImage?.url || 'https://via.placeholder.com/400x300'}
                                            alt={collection.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Badges */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                                        {collection.featured && (
                                            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                <Star size={12} fill="currentColor" />
                                                Featured
                                            </span>
                                        )}
                                        {!collection.isActive && (
                                            <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                                        {collection.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {collection.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                                        <span>Sort: {collection.sortOrder}</span>
                                        <span>Created: {new Date(collection.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/collections/${collection.slug}`}
                                            className="flex-1 text-center py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Eye size={16} />
                                            View
                                        </Link>
                                        <Link
                                            to={`/admin/collections/edit/${collection._id}`}
                                            className="flex-1 text-center py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => setDeleteConfirm(collection._id)}
                                            className="p-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Layers size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Collections Yet</h3>
                        <p className="text-gray-600 mb-6">Start by creating your first collection</p>
                        <Link
                            to="/admin/collections/add"
                            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                        >
                            Add Collection
                        </Link>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Collection?</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this collection? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Select All Checkbox */}
                {collections.length > 0 && (
                    <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedCollections.length === collections.length}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <span className="font-semibold text-gray-700">Select All</span>
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionsListPage;

