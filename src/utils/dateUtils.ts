export function getDateRange(start: string, end: string): string[] {
    const result: string[] = [];
    let current = new Date(start);
    const endDate = new Date(end);
  
    while (current <= endDate) {
      result.push(current.toLocaleDateString());
      current.setDate(current.getDate() + 1);
    }
  
    return result;
  }