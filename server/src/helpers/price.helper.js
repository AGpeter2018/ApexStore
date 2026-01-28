/**
 * Calculate multi-item (bulk) discounts based on quantity
 * @param {number} subtotal - The total price of all items
 * @param {number} totalItemsCount - The total number of items in the order
 * @returns {object} Object containing discountAmount, percentage, and type
 */
export const calculateDiscount = (subtotal, totalItemsCount) => {
    let percentage = 0;
    let type = 'none';
    let reason = '';

    if (totalItemsCount >= 10) {
        percentage = 15;
        type = 'bulk';
        reason = 'Bulk Buy Bonus (10+ Items)';
    } else if (totalItemsCount >= 6) {
        percentage = 10;
        type = 'bulk';
        reason = 'Bulk Buy Bonus (6-9 Items)';
    } else if (totalItemsCount >= 3) {
        percentage = 5;
        type = 'bulk';
        reason = 'Bulk Buy Bonus (3-5 Items)';
    }

    const discountAmount = Math.round((subtotal * (percentage / 100)) * 100) / 100;

    return {
        discountAmount,
        percentage,
        type,
        reason
    };
};
