/**
 * Time Rounding Utility
 * 
 * Rules:
 * - Schedule slots are every 30 minutes (e.g., 10:00, 10:30, 11:00, etc.)
 * - If a user clocks in within 0-5 minutes after a slot (e.g., 10:00–10:05), 
 *   the calculated time stays at that slot (10:00).
 * - If a user clocks in 6+ minutes after a slot (e.g., 10:06–10:29),
 *   the calculated time rounds FORWARD to the next slot (10:30).
 * 
 * For clock-out, the same logic applies (rounds forward if > 5 min past slot).
 */

/**
 * Get the calculated (rounded) time from an actual login/logout time.
 * @param {Date|string|object} timestamp - The actual clock-in or clock-out time (Date, string, or Firestore Timestamp)
 * @returns {Date|null} - The calculated (rounded) time, or null if invalid
 */
export function getCalculatedTime(timestamp) {
  if (!timestamp) return null;

  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = new Date(timestamp);
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return null;

  const minutes = date.getMinutes();

  // Find the previous 30-minute slot
  // e.g., for 10:06, the previous slot is 10:00; for 10:36, it's 10:30
  const slotMinutes = minutes < 30 ? 0 : 30;
  const minutesPastSlot = minutes - slotMinutes;

  const result = new Date(date);

  if (minutesPastSlot <= 5) {
    // Within grace period — snap to the slot time
    result.setMinutes(slotMinutes, 0, 0);
  } else {
    // Past grace period — round forward to next 30-min slot
    const nextSlot = slotMinutes + 30;
    if (nextSlot >= 60) {
      // Roll over to the next hour
      result.setHours(result.getHours() + 1, 0, 0, 0);
    } else {
      result.setMinutes(nextSlot, 0, 0);
    }
  }

  return result;
}

/**
 * Get the calculated (rounded) time for clock-out based on specific rules:
 * - Minutes 00-24 -> Round down to the hour
 * - Minutes 25-54 -> Round to the nearest half hour
 * - Minutes 55-59 -> Round up to the next hour
 * @param {Date|string|object} timestamp
 * @returns {Date|null}
 */
export function getCalculatedClockOut(timestamp) {
  if (!timestamp) return null;

  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = new Date(timestamp);
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return null;

  const minutes = date.getMinutes();
  const result = new Date(date);

  if (minutes >= 0 && minutes <= 24) {
    // Round down to the hour
    result.setMinutes(0, 0, 0);
  } else if (minutes >= 25 && minutes <= 54) {
    // Round to the half hour (30)
    result.setMinutes(30, 0, 0);
  } else if (minutes >= 55 && minutes <= 59) {
    // Round up to the next hour
    result.setHours(result.getHours() + 1, 0, 0, 0);
  }

  return result;
}

/**
 * Format a time as HH:MM AM/PM string
 * @param {Date|string|object} timestamp 
 * @returns {string}
 */
export function formatTimeShort(timestamp) {
  if (!timestamp) return "--:--";
  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }
  if (isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Calculate session duration using calculated (rounded) times for BOTH clock-in and clock-out.
 * The same 30-min slot rounding with 5-min grace period is applied to clock-out.
 * @param {Date|string|object} clockIn 
 * @param {Date|string|object} clockOut 
 * @returns {number} minutes
 */
export function calcCalculatedMinutes(clockIn, clockOut) {
  const calcIn = getCalculatedTime(clockIn);
  const calcOut = getCalculatedClockOut(clockOut);
  if (!calcIn || !calcOut) return 0;

  const diff = Math.floor((calcOut.getTime() - calcIn.getTime()) / 60000);
  return Math.max(0, Math.min(diff, 1440));
}
