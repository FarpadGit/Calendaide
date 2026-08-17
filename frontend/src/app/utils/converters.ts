export function parseUserData(userData: {
  user: any;
  contacts: any[];
  events: any[];
  token?: string;
}) {
  const result = { ...userData };
  result.events = result.events.map((e: any) => ({
    ...e,
    start: e.start !== null ? new Date(e.start) : undefined,
    end: e.end !== null ? new Date(e.end) : undefined,
    recurrenceData:
      e.recurrenceData !== null
        ? {
            ...e.recurrenceData,
            rrule: {
              ...e.recurrenceData.rrule,
              interval: JSON.parse(e.recurrenceData.rrule.interval),
              bymonthday: e.recurrenceData.rrule.bymonthday
                ? JSON.parse(e.recurrenceData.rrule.bymonthday)
                : undefined,
              byweekday: e.recurrenceData.rrule.byweekday
                ? JSON.parse(e.recurrenceData.rrule.byweekday)
                : undefined,
            },
          }
        : undefined,
  }));

  return result;
}

export function eventTypeToJSON(event: Partial<eventsType>) {
  const result = {
    ...event,
    start: toCorrectedISOString(event.start),
    end: toCorrectedISOString(event.end),
  };
  return result;
}

// start & end times are converted to datetime on backend database and need to be corrected with the browsers local timezone
// (recurrence data are stored as ISO strings which can be readily converted back to javascript dates)
function toCorrectedISOString(date: Date | undefined) {
  if (!date) return undefined;
  const _date = new Date(date);
  const tzOffset = -1 * _date.getTimezoneOffset();
  _date.setMinutes(_date.getMinutes() + tzOffset);
  return _date.toISOString();
}
