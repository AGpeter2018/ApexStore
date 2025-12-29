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
        <div className="cart-item">
            <div className="cart-item-image">
                <img src={item.image} alt={item.name} />
            </div>

            <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-item-price">₦{item.price.toLocaleString()}</p>
                {item.stock < 10 && (
                    <p className="stock-warning">Only {item.stock} left in stock</p>
                )}
            </div>

            <div className="cart-item-quantity">
                <button
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="quantity-btn"
                >
                    <Minus size={16} />
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="quantity-btn"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="cart-item-subtotal">
                <p>₦{(item.price * item.quantity).toLocaleString()}</p>
            </div>

            <button onClick={handleRemove} className="remove-btn" title="Remove item">
                <Trash2 size={20} />
            </button>

            <style jsx>{`
                .cart-item {
                    display: grid;
                    grid-template-columns: 100px 1fr auto auto auto;
                    gap: 20px;
                    align-items: center;
                    padding: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    margin-bottom: 15px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .cart-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .cart-item-image {
                    width: 100px;
                    height: 100px;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .cart-item-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .cart-item-details h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                    color: #333;
                }

                .cart-item-price {
                    font-size: 18px;
                    font-weight: 700;
                    color: #667eea;
                    margin: 0;
                }

                .stock-warning {
                    color: #ff6b6b;
                    font-size: 12px;
                    margin: 5px 0 0 0;
                }

                .cart-item-quantity {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #f5f5f5;
                    padding: 8px 12px;
                    border-radius: 8px;
                }

                .quantity-btn {
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .quantity-btn:hover:not(:disabled) {
                    background: #667eea;
                    color: white;
                    border-color: #667eea;
                }

                .quantity-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .quantity-value {
                    font-weight: 600;
                    min-width: 30px;
                    text-align: center;
                }

                .cart-item-subtotal p {
                    font-size: 20px;
                    font-weight: 700;
                    color: #333;
                    margin: 0;
                }

                .remove-btn {
                    background: #fee;
                    color: #ff6b6b;
                    border: none;
                    border-radius: 8px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .remove-btn:hover {
                    background: #ff6b6b;
                    color: white;
                }

                @media (max-width: 768px) {
                    .cart-item {
                        grid-template-columns: 80px 1fr;
                        gap: 15px;
                    }

                    .cart-item-quantity,
                    .cart-item-subtotal {
                        grid-column: 2;
                    }

                    .remove-btn {
                        grid-column: 2;
                        justify-self: end;
                    }
                }
            `}</style>
        </div>
    );
};

export default CartItem;
