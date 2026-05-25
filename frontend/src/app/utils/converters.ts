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
    start: event.start?.toISOString(),
    end: event.end?.toISOString(),
  };
  return result;
}
