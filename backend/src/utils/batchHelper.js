/**
 * Utility for generating unique batch IDs.
 * Separated for easier unit testing in isolation.
 */
const generateBatchId = () => {
    return `BATCH-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;
};

module.exports = {
    generateBatchId
};
