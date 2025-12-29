import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { selectCartCount } from '../redux/slices/cartSlice';

const CartIcon = () => {
    const navigate = useNavigate();
    const cartCount = useSelector(selectCartCount);

    return (
        <div className="cart-icon-container" onClick={() => navigate('/cart')}>
            <ShoppingCart size={24} />
            {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
            )}

            <style jsx>{`
                .cart-icon-container {
                    position: relative;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: background 0.2s;
                }

                .cart-icon-container:hover {
                    background: rgba(102, 126, 234, 0.1);
                }

                .cart-badge {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                    color: white;
                    font-size: 11px;
                    font-weight: 700;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }
            `}</style>
        </div>
    );
};

export default CartIcon;
