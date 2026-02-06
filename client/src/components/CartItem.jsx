import React from 'react';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateCartItem } from '../redux/slices/cartSlice';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartItem = ({ item }) => {
    const dispatch = useDispatch();

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;
        if (newQuantity > item.stock) {
            alert(`Only ${item.stock} items available in stock`);
            return;
        }
        dispatch(updateCartItem({ productId: item.product._id, quantity: newQuantity }));
    };

    const handleRemove = () => {
        if (window.confirm('Remove this item from cart?')) {
            dispatch(removeFromCart(item.product._id));
        }
    };

    return (
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden mb-4">
            <div className="flex flex-col sm:flex-row items-center p-4 sm:p-6 gap-4 sm:gap-6">
                {/* Product Image */}
                <div className="w-full sm:w-24 h-48 sm:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{item.name}</h3>
                    <p className="text-indigo-600 font-bold text-xl mb-2">₦{item.price.toLocaleString()}</p>
                    {item.stock < 10 && (
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-red-500 text-xs font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                            Only {item.stock} left in stock
                        </div>
                    )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                    <button
                        onClick={() => handleQuantityChange(item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all font-bold shadow-sm"
                    >
                        <Minus size={18} />
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900">{item.quantity}</span>
                    <button
                        onClick={() => handleQuantityChange(item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all font-bold shadow-sm"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {/* Subtotal */}
                <div className="w-full sm:w-auto text-center sm:text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Subtotal</p>
                    <p className="text-2xl font-black text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>

                {/* Remove Button */}
                <button
                    onClick={handleRemove}
                    className="absolute top-4 right-4 sm:static w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 group/remove shadow-sm sm:shadow-none"
                    title="Remove item"
                >
                    <Trash2 size={20} className="group-hover/remove:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default CartItem;
