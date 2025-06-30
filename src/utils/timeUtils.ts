import dayjs from "dayjs";
import moment from 'moment-timezone';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getTimeZones() {
    return moment.tz.names().map(tz => {
        const offset = moment.tz(tz).format('Z');
        return {
          label: `${tz} (GMT ${offset})`,
          value: tz,
        };
    });
}


export function convertTimeToUTC(timeStr: string, timezoneStr: string): string {
  const date = '2025-01-01'; 
  const dateTimeInZone = dayjs.tz(`${date} ${timeStr}`, 'YYYY-MM-DD HH:mm', timezoneStr);
  return dateTimeInZone.utc().format();
}

export function convertUtcTimeToLocal(utcTime: string, timezone: string | null) {
  // Handle null or invalid timezone
  if (!timezone || timezone === 'null' || timezone === 'undefined') {
    // Fallback to UTC if no timezone is provided
    return dayjs.utc(utcTime);
  }
  
  try {
    const utcMoment = dayjs.utc(utcTime).tz(timezone);
    return utcMoment;
  } catch (error) {
    console.warn(`Invalid timezone "${timezone}", falling back to UTC:`, error);
    // Fallback to UTC if timezone is invalid
    return dayjs.utc(utcTime);
  }
}