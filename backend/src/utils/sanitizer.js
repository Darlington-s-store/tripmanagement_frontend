/**
 * Strip sensitive fields from an object or array of objects
 * @param {Object|Array} data 
 * @param {Array} sensitiveFields 
 * @returns {Object|Array}
 */
export function sanitizeOutput(data, sensitiveFields = ['password_hash', 'refresh_token', 'reset_password_token', 'reset_password_expiry']) {
    if (!data) return data;

    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        const newObj = { ...obj };
        sensitiveFields.forEach(field => {
            delete newObj[field];
        });

        // Recursively sanitize check
        Object.keys(newObj).forEach(key => {
            if (typeof newObj[key] === 'object') {
                newObj[key] = sanitize(newObj[key]);
            }
        });

        return newObj;
    };

    if (Array.isArray(data)) {
        return data.map(item => sanitize(item));
    }

    return sanitize(data);
}
