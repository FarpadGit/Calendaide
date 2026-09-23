from db import db, Event, Contact, User
from dto import EventDTO, ContactCredentialsDTO
from utils.converters import trimmed_dict, DTO_to_Event
from typing import Callable

def read_user_settings(user_booking_id: str):
    user = __get_user_by_booking_id(user_booking_id)
    if user is None: return None
    return {
        "displayName": user.displayname,
        "businessHours": list(map(User.model_dump, user.settings.businessHours)),
        "bookingData": User.model_dump(user.settings.bookingData),
    }

def read_events_for_booking(user_booking_id: str):
    user = __get_user_by_booking_id(user_booking_id)
    if user is None: return None
    events = []
    with db.events.find({"userid": str(user.id), "start": {"$not": {"$eq": None}}}) as cursor:
        for _event in cursor:
            event = Event.model_validate(_event)
            event_data = {
                "start": str(event.start),
                "end": str(event.end),
                "recurrenceData": event.recurrenceData
            }
            if not event.allDay: events.append(event_data)
    return events

def read_unscheduled_events_for_contact(user_booking_id: str, contact_credentials: ContactCredentialsDTO):
    user = __get_user_by_booking_id(user_booking_id)
    if user is None: return None
    condition: Callable[[Contact], bool] = lambda c: c.name == contact_credentials.name and c.bookingPassword == contact_credentials.password
    contact = next((c for c in user.contacts if condition(c)), None)
    if contact is None: return None
    event_ids = []
    with db.events.find({"userid": str(user.id), "contactid": contact.id, "start": None}) as cursor:
        for _event in cursor:
            event = Event.model_validate(_event)
            event_ids.append(event.clientid)
    return {"contactId": contact.id, "ids": event_ids}

def book_events(user_booking_id: str, events: list[EventDTO]):
    user = __get_user_by_booking_id(user_booking_id)
    if user is None: return None
    for eventDTO in events:
        if eventDTO.contactId != "BOOKED_EVENTS":
            contact_exist: bool = [c for c in user.contacts if c.id == eventDTO.contactId].__len__() > 0
            if not contact_exist: return None
        event = DTO_to_Event(eventDTO, str(user.id))
        _event = trimmed_dict(Event.model_dump(event))

        if eventDTO.contactId != "BOOKED_EVENTS":
            db.events.update_one({"clientid": event.clientid, "contactid": event.contactid}, {"$set": _event})
        else: 
            db.events.insert_one(_event)
    return True

def __get_user_by_booking_id(user_booking_id: str):
    db_user = db.users.find_one({"settings.bookingData.bookingId": user_booking_id})
    if not db_user: return None
    if ("settings" not in db_user or
        "bookingData" not in db_user["settings"] or
        "bookingEnabled" not in db_user["settings"]["bookingData"] or
        not db_user["settings"]["bookingData"]["bookingEnabled"]
    ): return None
    return User.model_validate(db_user)