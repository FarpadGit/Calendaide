from typing import Any
from datetime import datetime
from db import Contact, Event
from dto import ContactDTO, EventDTO, Undefined

# dictionary without any {"key": None} pairs
def trimmed_dict(obj: dict[any, any] | Any):
    if type(obj) is list: return [trimmed_dict(item) for item in obj]
    if type(obj) is not dict: return obj
    return {key: trimmed_dict(value) for key, value in obj.items() if value is not None}

def DTO_to_Contact(dto: ContactDTO):
   return Contact(
      id= dto.id,
      name= dto.name,
      comment= dto.comment if dto.comment != Undefined else None,
      color= dto.color if dto.color != Undefined else None,
   )

def DTO_to_Event(dto: EventDTO, user_id: str):
    event = Event(
        clientid= dto.id,
        type= dto.type,
        title= dto.title,
        allDay= dto.allDay if dto.allDay != Undefined else None,
        start= dto.start if dto.start != Undefined else None,
        end= dto.end if dto.end != Undefined else None,
        recurrenceData= None,
        comment= dto.comment if dto.comment != Undefined else None,
        contactid= dto.contactId,
        userid=user_id
    )
      
    if dto.recurrenceData != Undefined:
        recurrence_data = Event.RecurrenceData(
            groupId= dto.recurrenceData.groupId,
            rrule= Event.RecurrenceData.RRule(
                freq= dto.recurrenceData.rrule.freq,
                interval= dto.recurrenceData.rrule.interval,
                bymonthday= dto.recurrenceData.rrule.bymonthday,
                byweekday= dto.recurrenceData.rrule.byweekday,
                dtstart= dto.recurrenceData.rrule.dtstart,
                until= dto.recurrenceData.rrule.until
            )
        )
        event.recurrenceData = recurrence_data
        if recurrence_data.rrule.until is not None: event.expiresAt = datetime.fromisoformat(recurrence_data.rrule.until)
    return event