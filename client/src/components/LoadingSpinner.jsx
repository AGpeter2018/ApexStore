import React from 'react';

const LoadingSpinner = ({ fullPage = true, size = 'h-12 w-12', color = 'border-amber-500' }) => {
    return (
        <div className={`flex justify-center items-center ${fullPage ? 'min-h-screen' : 'py-12'}`}>
            <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
        </div>
    );
};

export default LoadingSpinner;
