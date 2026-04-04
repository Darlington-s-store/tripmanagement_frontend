/**
 * Strip sensitive fields from an object or array of objects
 * @param {Object|Array} data 
 * @param {Array} sensitiveFields 
 * @returns {Object|Array}
 */
export function sanitizeOutput(data, sensitiveFields = ['password_hash', 'refresh_token', 'reset_password_token', 'reset_password_expiry']) {
    if (!data) return data;

    const sanitize = (obj) => {
        if (obj === null || obj === undefined) return obj;
        // pg returns DATE/TIMESTAMP as Date; spreading a Date yields {} and corrupts JSON output
        if (obj instanceof Date) return obj;
        if (Array.isArray(obj)) return obj.map((item) => sanitize(item));
        if (typeof obj !== 'object') return obj;

        const newObj = { ...obj };
        sensitiveFields.forEach(field => {
            delete newObj[field];
        });

        Object.keys(newObj).forEach(key => {
            const value = newObj[key];
            if (value !== null && typeof value === 'object') {
                newObj[key] = sanitize(value);
            }
        });

        return newObj;
    };

    if (Array.isArray(data)) {
        return data.map(item => sanitize(item));
    }

    return sanitize(data);
}
