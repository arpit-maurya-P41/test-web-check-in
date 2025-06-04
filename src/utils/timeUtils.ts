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
  console.log(dateTimeInZone.utc().format());
  return dateTimeInZone.utc().format();
}