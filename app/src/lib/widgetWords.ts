// How the home screen widgets say a day and a time ("tomorrow", "Mon, Oct 26",
// "9:00 pm"), shared by lib/widgetTimeline and lib/widgetMore. Pure.

export const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const dayStart = (d: Date | number) => {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
};

export function daysApart(from: Date, to: Date): number {
  return Math.round((dayStart(to).getTime() - dayStart(from).getTime()) / 86_400_000);
}

/** "tonight", "tomorrow", "Friday", "in 12 days". */
export function whenWords(day: Date, date: Date): string {
  const apart = daysApart(day, date);
  if (apart <= 0) return 'tonight';
  if (apart === 1) return 'tomorrow';
  if (apart < 7) return WEEKDAY[date.getDay()];
  return `in ${apart} days`;
}

/** "Mon, Oct 26". */
export function shortDate(date: Date): string {
  return `${SHORT_DAY[date.getDay()]}, ${SHORT_MONTH[date.getMonth()]} ${date.getDate()}`;
}

/** "9:00 pm". */
export function clock(date: Date): string {
  const h = date.getHours();
  return `${h % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/** "Today · 9:00 pm", "Friday · 7:30 pm", "Nov 3 · 8:00 pm". */
export function dayAndTime(day: Date, start: Date): string {
  const apart = daysApart(day, start);
  const dayWord = apart === 0 ? 'Today' : apart === 1 ? 'Tomorrow' : apart < 7 ? WEEKDAY[start.getDay()] : `${SHORT_MONTH[start.getMonth()]} ${start.getDate()}`;
  return `${dayWord} · ${clock(start)}`;
}
