from db import db, Event
from dto import EventDTO, Undefined
from utils.converters import trimmed_dict, DTO_to_Event

def create_events(user_id: str, events: list[EventDTO]):
    new_events = []
    for event in events:
        _event = DTO_to_Event(event, user_id)
        _event_dict = trimmed_dict(Event.model_dump(_event))
        new_events.append(_event_dict)

    db.events.insert_many(new_events)

def update_events(user_id: str, events: list[EventDTO]):
    for event in events:
        db_event = db.events.find_one({"clientid": event.id, "userid": user_id})
        if not db_event: continue

        _event = Event.model_validate(db_event)

        if event.type != Undefined: _event.type = event.type
        if event.title != Undefined: _event.title = event.title
        if event.allDay != Undefined: _event.allDay = event.allDay
        if event.start != Undefined: _event.start = event.start
        if event.end != Undefined: _event.end = event.end
        if event.recurrenceData != Undefined: _event.recurrenceData = event.recurrenceData
        if event.comment != Undefined: _event.comment = event.comment

        set = trimmed_dict(Event.model_dump(_event))
        if "allDay" in set and set["allDay"] is False: del set["allDay"]
        
        unset = trimmed_dict({
            "start": "" if event.start == None else None,
            "end": "" if event.end == None else None,
            "allDay": "" if event.allDay == False else None,
            "comment": "" if event.comment == None else None,
            "recurrenceData": "" if event.recurrenceData == None else None,
        })
        
        db.events.update_one({"clientid": event.id, "userid": user_id}, { "$set": set, "$unset": unset })

def delete_events(user_id: str, event_ids: list[str]):
   db.events.delete_many({"userid": user_id, "clientid": {"$in": event_ids} })

def delete_all_events_for_user(user_id: str):
   db.events.delete_many({"userid": user_id})