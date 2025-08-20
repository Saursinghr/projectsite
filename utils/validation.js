const mongoose = require('mongoose');

/**
 * Clean and validate ObjectId
 * @param {string} id - The ID to validate
 * @returns {string|null} - Cleaned ID or null if invalid
 */
const validateObjectId = (id) => {
    if (!id) return null;
    
    // Clean the ID by removing whitespace and newlines
    const cleanId = id.toString().trim();
    
    // Validate ObjectId format (24 character hex string)
    if (!cleanId.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
    }
    
    return cleanId;
};

/**
 * Check if string is a valid ObjectId
 * @param {string} id - The ID to check
 * @returns {boolean} - True if valid ObjectId
 */
const isValidObjectId = (id) => {
    return validateObjectId(id) !== null;
};

/**
 * Convert string to ObjectId if valid
 * @param {string} id - The ID to convert
 * @returns {mongoose.Types.ObjectId|null} - ObjectId or null if invalid
 */
const toObjectId = (id) => {
    const cleanId = validateObjectId(id);
    if (!cleanId) return null;
    
    try {
        return new mongoose.Types.ObjectId(cleanId);
    } catch (error) {
        return null;
    }
};

module.exports = {
    validateObjectId,
    isValidObjectId,
    toObjectId
};
