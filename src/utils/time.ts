// src/utils/time.ts
// Date and time formatting utilities

/**
 * Format a timestamp to a readable date string
 * @param timestamp - Epoch milliseconds
 * @returns Formatted date string (e.g., "Jan 16, 2026")
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Format a timestamp to a readable date and time string
 * @param timestamp - Epoch milliseconds
 * @returns Formatted datetime string (e.g., "Jan 16, 2026 at 2:30 PM")
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  const dateStr = date.toLocaleDateString("en-US", dateOptions);
  const timeStr = date.toLocaleTimeString("en-US", timeOptions);
  return `${dateStr} at ${timeStr}`;
}

/**
 * Format a timestamp to time only
 * @param timestamp - Epoch milliseconds
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  return date.toLocaleTimeString("en-US", options);
}

/**
 * Format seconds to MM:SS clock format
 * @param seconds - Total seconds
 * @returns Clock format string (e.g., "05:30")
 */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/**
 * Convert seconds to match minute (for event logging)
 * @param seconds - Total seconds elapsed in match
 * @returns Match minute (0-90)
 */
export function secondsToMinute(seconds: number): number {
  const s = Math.max(0, Math.floor(seconds || 0));
  return Math.min(90, Math.floor(s / 60));
}

/**
 * Format match minute for display
 * @param seconds - Total seconds elapsed in match
 * @returns Formatted minute (e.g., "45'")
 */
export function formatMatchMinute(seconds: number): string {
  return `${secondsToMinute(seconds)}'`;
}

/**
 * Get relative time string (e.g., "2 hours ago", "just now")
 * @param timestamp - Epoch milliseconds
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}

/**
 * Check if a date is today
 * @param timestamp - Epoch milliseconds
 * @returns True if date is today
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 * @param timestamp - Epoch milliseconds
 * @returns True if date is in the past
 */
export function isPast(timestamp: number): boolean {
  return timestamp < Date.now();
}

/**
 * Check if a date is in the future
 * @param timestamp - Epoch milliseconds
 * @returns True if date is in the future
 */
export function isFuture(timestamp: number): boolean {
  return timestamp > Date.now();
}

/**
 * Format a date range
 * @param startTimestamp - Start date epoch milliseconds
 * @param endTimestamp - End date epoch milliseconds
 * @returns Formatted date range (e.g., "Jan 16 - Jan 18, 2026")
 */
export function formatDateRange(startTimestamp: number, endTimestamp: number): string {
  const start = new Date(startTimestamp);
  const end = new Date(endTimestamp);

  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    // Same month
    const options: Intl.DateTimeFormatOptions = { month: "short" };
    const month = start.toLocaleDateString("en-US", options);
    return `${month} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
  } else if (start.getFullYear() === end.getFullYear()) {
    // Same year, different months
    const startOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const endOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    return `${start.toLocaleDateString("en-US", startOptions)} - ${end.toLocaleDateString("en-US", endOptions)}`;
  } else {
    // Different years
    return `${formatDate(startTimestamp)} - ${formatDate(endTimestamp)}`;
  }
}