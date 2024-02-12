import moment, { Moment } from 'moment-timezone'

export const toSameDateInUTC = (date: Date | Moment | string, originTimezone: string = moment.tz.guess()) => {
  return toSameDateInTimezone(date, 'utc', originTimezone);
}

export const toSameDateInTimezone = (date: Date | Moment | string, targetTimezone: string, originTimezone: string = moment.tz.guess()) => {
  return moment(date).add(getTimezoneOffset(date, originTimezone, targetTimezone), 'minutes').tz(targetTimezone);
}

const getTimezoneOffset = (date: Date | Moment | string, originTimezone: string, targetTimezone: string) => {
  return moment.tz(date, originTimezone).utcOffset() - moment.tz(date, targetTimezone).utcOffset();
}
