type userType = {
  id: string;
  email: string;
  displayname: string;
  // server side stored settings
  settings?: {
    saveMode?: 'auto' | 'manual';
  };
};

type userModifiableType = Pick<userType, 'displayname' | 'settings'> & { password: string };

type contactType = {
  id: string;
  name: string;
  comment?: string;
  color?: string;
};

type eventsType = {
  id: string;
  type: 'single' | 'recurring';
  title: string;
  allDay?: boolean;
  start?: Date;
  end?: Date;
  recurrenceData?: {
    groupId: string | null;
    rrule: {
      freq: 'daily' | 'weekly' | 'monthly';
      interval: number;
      bymonthday?: number[];
      byweekday?: number[];
      dtstart: string;
      until?: string;
    };
  };
  comment?: string;
  contactId: string;
};

type DeepRequired<T> = Required<{
  [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>;
}>;
