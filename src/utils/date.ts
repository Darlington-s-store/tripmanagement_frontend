import { format, isValid, parseISO } from 'date-fns';

/**
 * Validates a date input and returns a Date object or null
 */
export const getValidDate = (dateInput: Date | string | number | null | undefined): Date | null => {
  if (!dateInput) return null;
  
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    return isValid(date) ? date : null;
  } catch (error) {
    return null;
  }
};

/**
 * Formats a date string or object safely
 */
export const formatDate = (
  dateInput: Date | string | number | null | undefined,
  formatStr: string = "MMM dd, yyyy",
  fallback: string = ""
): string => {
  const date = getValidDate(dateInput);
  if (!date) return fallback;
  
  try {
    return format(date, formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return fallback;
  }
};

/**
 * Formats a trip date range
 */
export const formatTripDate = (startDate: Date | string | number | null | undefined, endDate: Date | string | number | null | undefined): string => {
  const startStr = formatDate(startDate, "MMM dd");
  const endStr = formatDate(endDate, "MMM dd, yyyy");
  
  if (!startStr && !endStr) return "Dates not set";
  if (!startStr) return `Until ${endStr}`;
  if (!endStr) return `From ${startStr}`;
  
  return `${startStr} - ${endStr}`;
};

/**
 * Formats a booking date range
 */
export const formatBookingRange = (checkIn?: Date | string | number | null | undefined, checkOut?: Date | string | number | null | undefined): string => {
  const startStr = formatDate(checkIn, "MMM dd, yyyy");
  const endStr = formatDate(checkOut, "MMM dd, yyyy");

  if (!startStr && !endStr) return "Dates not set";
  if (!startStr) return `Until ${endStr}`;
  if (!endStr) return `From ${startStr}`;

  return `${startStr} - ${endStr}`;
};

export const formatDateRange = (
  startDate?: Date | string | number | null | undefined,
  endDate?: Date | string | number | null | undefined
): string => {
  return formatTripDate(startDate, endDate);
};

export function formatDateTime(value?: Date | string | number | null | undefined): string {
  return formatDate(value, "MMM dd, yyyy, hh:mm a", "Not set");
}

/**
 * Formats currency safely
 */
export const formatCurrency = (amount: string | number | null | undefined, currency: string = "GHS", fallback: string = "Not set"): string => {
  if (amount === null || amount === undefined || amount === "") return fallback;
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return fallback;
  return `${currency} ${num.toLocaleString()}`;
};

/**
 * Formats a number with fallback
 */
export const formatNumber = (value: string | number | null | undefined, suffix: string = "", fallback: string = "Not set"): string => {
  if (value === null || value === undefined || value === "") return fallback;
  const num = typeof value === 'number' ? value : parseInt(value);
  if (isNaN(num)) return fallback;
  return `${num}${suffix}`;
};

/**
 * Calculates the number of days in a trip
 */
export const getTripDurationDays = (startDate?: Date | string | number | null | undefined, endDate?: Date | string | number | null | undefined): number => {
  const start = getValidDate(startDate);
  const end = getValidDate(endDate);
  if (!start || !end) return 0;
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
};

/**
 * Specific formatters object
 */
export const formatters = {
  full: (d: Date | string | number | null | undefined) => formatDate(d, "MMMM dd, yyyy"),
  short: (d: Date | string | number | null | undefined) => formatDate(d, "MMM dd"),
  time: (d: Date | string | number | null | undefined) => formatDate(d, "hh:mm a"),
  iso: (d: Date | string | number | null | undefined) => {
    const date = getValidDate(d);
    return date ? date.toISOString().split('T')[0] : "";
  }
};
