export const CONVERSION_RATE = 15; // 1 USD = 15 GHS

/**
 * Converts US Dollars to Ghana Cedis
 */
export const convertUsdToGhs = (usd: number): number => {
    return usd * CONVERSION_RATE;
};

/**
 * Converts Ghana Cedis to US Dollars
 */
export const convertGhsToUsd = (ghs: number): number => {
    return ghs / CONVERSION_RATE;
};

/**
 * Formats a number as Ghana Cedis
 */
export const formatGHS = (amount: number): string => {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
    }).format(amount);
};
