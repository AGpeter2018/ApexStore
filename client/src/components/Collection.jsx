import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import ProductAdminFilterAndSearch from './ProductAdminFilterAndSearch';

const Collections = () => {
    const [collections, setCollections] = useState([]);
    const [filteredCollections, setFilteredCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/collections`);
            setCollections(data.data);
            setFilteredCollections(data.data);
            setLoading(false);
            console.log('Fetched collections:', data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch collections');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-35">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    const handleFilter = (result) => {
    setFilteredCollections(result);

    if (result.length === 0) {
        setError("No matching collections found.");
    } else {
        setError("");
    }
};


    return (
            <main className="container mx-auto px-4 py-25 flex-grow">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-xl md:text-4xl text-slate-900 font-bold">Our Collections</h1>
                    <Link 
                        to="/admin/add-collection"
                        className="bg-blue-600 text-white text-sm md:text-xl p-3 lg:px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        Add Collection
                    </Link>
                </div>

                <ProductAdminFilterAndSearch collections={collections} onFilter={handleFilter} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCollections.map((collection) => (
                    <Link to={`/collections/${collection.slug}`} key={collection._id}>
                        <div 
                            className="bg-white rounded-lg md:shadow-sm shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            <div className="relative h-50 sm:h-64 overflow-hidden">
                                <img
                                    src={collection.collectionImage?.url || 'https://via.placeholder.com/400'}
                                    alt={collection.name}
                                    className="w-80 h-full object-cover hover:scale-110 transition-transform duration-300 mx-auto"
                                />
                            </div>
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-2">{collection.name}</h2>
                                <p className="text-gray-600 mb-4">{collection.description}</p>
                                <div className="text-sm text-gray-500">
                                    Created: {new Date(collection.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </Link>
                    ))}
                </div>

                {collections.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No collections available yet.</p>
                    </div>
                )}
            </main>
    );
};

export default Collections;