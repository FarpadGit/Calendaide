from db import db, Event
from dto import EventDTO, Undefined
from utils.converters import trimmed_dict, DTO_to_Event

def create_events(user_id: str, events: list[EventDTO]):
    new_events = []
    for eventDTO in events:
        event = DTO_to_Event(eventDTO, user_id)
        _event = trimmed_dict(Event.model_dump(event))
        new_events.append(_event)

    db.events.insert_many(new_events)

def update_events(user_id: str, events: list[EventDTO]):
    for eventDTO in events:
        db_event = db.events.find_one({"clientid": eventDTO.id, "userid": user_id})
        if not db_event: continue

        event = Event.model_validate(db_event)

        if eventDTO.type != Undefined: event.type = eventDTO.type
        if eventDTO.title != Undefined: event.title = eventDTO.title
        if eventDTO.allDay != Undefined: event.allDay = eventDTO.allDay
        if eventDTO.start != Undefined: event.start = eventDTO.start
        if eventDTO.end != Undefined: event.end = eventDTO.end
        if eventDTO.recurrenceData != Undefined: event.recurrenceData = eventDTO.recurrenceData
        if eventDTO.comment != Undefined: event.comment = eventDTO.comment

        set = trimmed_dict(Event.model_dump(event))
        if "allDay" in set and set["allDay"] is False: del set["allDay"]
        
        unset = trimmed_dict({
            "start": "" if eventDTO.start == None else None,
            "end": "" if eventDTO.end == None else None,
            "allDay": "" if eventDTO.allDay == False else None,
            "comment": "" if eventDTO.comment == None else None,
            "recurrenceData": "" if eventDTO.recurrenceData == None else None,
        })
        
        db.events.update_one({"clientid": eventDTO.id, "userid": user_id}, { "$set": set, "$unset": unset })

def delete_events(user_id: str, event_ids: list[str]):
   db.events.delete_many({"userid": user_id, "clientid": {"$in": event_ids} })

def delete_all_events_for_user(user_id: str):
   db.events.delete_many({"userid": user_id})