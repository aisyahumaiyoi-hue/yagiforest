/**
 * Shared, timezone-aware date helpers.
 *
 * YAGI's customers are in Indonesia. All customer-facing dates must be rendered
 * in one business timezone rather than the viewer's machine timezone, otherwise
 * a routine completed in Jakarta can appear on the wrong day for a device set to
 * UTC. Keep every date assumption here, not scattered across components.
 */
export const BUSINESS_TIMEZONE = "Asia/Jakarta";

const DATE_PARTS = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

/** Calendar date (YYYY-MM-DD) in the YAGI business timezone. */
export const businessDateKey = (date = new Date()) => DATE_PARTS.format(date);

/** YYYY-MM-DD for `offsetDays` relative to the business-timezone today. */
export const businessDateKeyOffset = (offsetDays) => {
    const [y, m, d] = businessDateKey().split("-").map(Number);
    const base = new Date(Date.UTC(y, m - 1, d));
    base.setUTCDate(base.getUTCDate() + offsetDays);
    return base.toISOString().slice(0, 10);
};

/** Weekday index (0 = Sunday) for a business-timezone calendar date key. */
export const weekdayIndex = (dateKey) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

/** Day of month for a business-timezone calendar date key. */
export const dayOfMonth = (dateKey) => Number(dateKey.slice(8, 10));

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "short",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIMEZONE,
    day: "numeric",
    month: "short",
});

/** e.g. "Tuesday, 15 Sep" in Jakarta time. */
export const formatBusinessLongDate = (date = new Date()) => LONG_DATE.format(date);

/** e.g. "15 Sep" in Jakarta time. Accepts an ISO string or Date. */
export const formatBusinessShortDate = (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return SHORT_DATE.format(d);
};
