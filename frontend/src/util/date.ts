import {
  add,
  set,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from "date-fns"

/**
 * mergeDates merges the date part of the first date with the time part of the second date.
 * @param dateWithDate the date with the date part
 * @param dateWithTime the date with the time part
 * @returns the merged date
 */
export function mergeDates(dateWithDate: Date, dateWithTime: Date): Date {
  let mergedDate = setHours(dateWithDate, dateWithTime.getHours())
  mergedDate = setMinutes(mergedDate, dateWithTime.getMinutes())
  mergedDate = setSeconds(mergedDate, dateWithTime.getSeconds())
  return setMilliseconds(mergedDate, dateWithTime.getMilliseconds())
}

/**
 * formatDuration formats a duration object into a string.
 * e. g. { hours: 1, minutes: 30, seconds: 15 } => "1h 30m 15s"
 * @param duration the duration object
 * @returns the formatted duration string
 */
export function formatDuration(duration: Duration) {
  const result: string[] = []
  duration.hours && result.push(`${duration.hours}h`)
  duration.minutes && result.push(`${duration.minutes}m`)
  duration.seconds && result.push(`${duration.seconds}s`)
  duration.days && result.push(`${duration.days}d`)
  if (result.length === 0) {
    return "n/a"
  }
  return result.join(" ")
}

/**
 * getNextQuarterHour returns the next quarter hour from the given date.
 * @param date the date
 * @returns the next quarter hour
 */
export function getNextQuarterHour(date: Date) {
  let minutesToAdd = 15 - (date.getMinutes() % 15)
  minutesToAdd = minutesToAdd === 15 ? 0 : minutesToAdd

  if (
    date.getMinutes() % 15 === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  ) {
    return date
  }

  return set(add(date, { minutes: minutesToAdd }), {
    seconds: 0,
    milliseconds: 0,
  })
}
