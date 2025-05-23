import moment, { Moment } from "moment-timezone";

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

export function convertToUTC(time : Moment, timezone : string) {
    const hour = time.hour();
    const minute = time.minute();
  
    const now = moment().tz(timezone);
  
    let userDateTime = moment.tz(
      {
        year: now.year(),
        month: now.month(), 
        day: now.date(),
        hour,
        minute,
        second: 0,
        millisecond: 0,
      },
      timezone
    );
  
    if (userDateTime.isBefore(now)) {
      userDateTime = userDateTime.add(1, "day");
    }
  
    return userDateTime.clone().utc().toISOString();
}

export function convertUtcTimeToLocal(utcTime: string): moment.Moment {
    const todayUtc = moment.utc().startOf("day"); 
    const date = new Date(utcTime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const utcMoment = todayUtc.clone().add(hours, "hours").add(minutes, "minutes");
    return utcMoment;
}