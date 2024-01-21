/**
 * Function to format time based on the provided template.
 *
 * @param {number} value - Date object.
 * @param {string} mask - Time formatting template. Supports the following tokens:
 *                        - yyyy: year (e.g., 2023)
 *                        - MM: month (01-12)
 *                        - MONTH: month abbreviation (e.g., Jan, Feb)
 *                        - MONTH-FUL: month abbreviation (e.g., January, February)
 *                        - dd: day of the month (01-31)
 *                        - DAY: day of the week (e.g., Mon, Tue)
 *                        - DAY-FULL: day of the week (e.g., Monday, Tuesday)
 *                        - HH: hour (00-23)
 *                        - mm: minute (00-59)
 *                        - ss: second (00-59)
 * @returns {string} A string representing the formatted time according to the provided template.
 */

export function formatDate(value: string | number | Date, mask: string, timezone = 0): string {
  let date = new Date(value);

  let utc = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
  let timezonedDate = new Date(utc.getTime() + timezone * 1000);
  date = timezonedDate;

  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek3leter = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const tokens: { [key: string]: string } = {
    'yyyy': date.getFullYear().toString(),
    'MM': String(date.getMonth() + 1).padStart(2, '0'),
    'MONTH': monthAbbr[date.getMonth()],
    'MONTH-FULL': month[date.getMonth()],
    'dd': String(date.getDate()).padStart(2, '0'),
    'DAY': dayOfWeek3leter[date.getDay()],
    'DAY-FULL': dayOfWeek[date.getDay()],
    'HH': String(date.getHours()).padStart(2, '0'),
    'mm': String(date.getMinutes()).padStart(2, '0'),
    'ss': String(date.getSeconds()).padStart(2, '0')
  };

  let result = mask;
  for (const token in tokens) {
    result = result.replace(token, tokens[token]);
  }

  return result;
}