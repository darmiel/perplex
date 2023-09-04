declare module "cal-parser" {
  export interface Params {
    [key: string]: string
  }

  export interface Metadata {
    [key: string]: any
  }

  export interface Event {
    rrule?: string
    recurrenceRule?: any
    uid?: number | string
    dtstart?: {
      value: Date
      params?: Params
    }
    dtend?: {
      value: Date
      params?: Params
    }
    created?: Date
    lastModified?: Date
    dtstamp?: Date
    status?: {
      value: string
      params?: Params
    }
    location?: {
      value: string
      params?: Params
    }
    summary?: {
      value: string
      params?: Params
    }
    description?: {
      value: string
      params?: Params
    }
    transp?: {
      value: string
      params?: Params
    }
    sequence?: {
      value: string
      params?: Params
    }
    organizer?: {
      value: string
      params?: Params
    }
    attendee?: {
      value: string
      params?: Params
    }
    [otherKey: string]:
      | {
          value: any
          params?: Params
        }
      | undefined
  }

  export interface ParsedCalendar {
    calendarData: Metadata
    events: Event[]
    getEventsOnDate(dateToCheck: Date): Event[]
    getEventsBetweenDates(
      startDate: Date,
      endDate: Date,
      inclusive: boolean,
    ): Event[]
  }

  export function parseString(st: string, max?: number): ParsedCalendar
}
