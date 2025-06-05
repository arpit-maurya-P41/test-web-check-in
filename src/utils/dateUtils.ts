import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getDateRange(start: string, end: string): string[] {
    const result: string[] = [];
    const current = new Date(start);
    const endDate = new Date(end);
  
    while (current <= endDate) {
      result.push(current.toLocaleDateString());
      current.setDate(current.getDate() + 1);
    }
  
    return result;
  }