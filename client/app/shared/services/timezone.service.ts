import { Injectable } from '@angular/core';
import moment, { Moment } from 'moment-timezone'

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {
  constructor() {}

  toSameDateInUTC(date: Date | Moment | string, originTimezone: string = moment.tz.guess()) {
    return this.toSameDateInTimezone(date, 'utc', originTimezone);
  }

  toSameDateInCurrentTimezone(date: Date | Moment | string, originTimezone: string) {
    return this.toSameDateInTimezone(date, moment.tz.guess(), originTimezone);
  }

  toSameDateInTimezone(date: Date | Moment | string, targetTimezone: string, originTimezone: string = moment.tz.guess()) {
    return moment(date).tz(originTimezone).add(this.getTimezoneOffset(date, targetTimezone, originTimezone), 'minutes').tz(targetTimezone);
  }

  private getTimezoneOffset(date: Date | Moment | string, targetTimezone: string, originTimezone: string) {
    return moment.tz(date, originTimezone).utcOffset() - moment.tz(date, targetTimezone).utcOffset();
  }
}
