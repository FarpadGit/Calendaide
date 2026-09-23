from fastapi import APIRouter, HTTPException
from dto import EventsDTO, ContactCredentialsDTO
from services import booking

router = APIRouter(prefix="/booking", tags=["Booking"])

@router.get("/{bookingid}", status_code=200)
async def read_events_for_booking(bookingid: str):
    print("booking data for:", bookingid)
    settings = booking.read_user_settings(bookingid)
    events = booking.read_events_for_booking(bookingid)
    if settings is None or events is None: raise HTTPException(status_code=401, detail="access denied")
    return { "settings": settings, "events": events }

@router.post("/{bookingid}", status_code=201)
async def book_events(body: EventsDTO, bookingid: str):
    print(body, bookingid)
    result = booking.book_events(bookingid, body.events)
    if result is None: raise HTTPException(status_code=400, detail="booking failed")

@router.post("/{bookingid}/contacts", status_code=200)
async def read_unscheduled_events_for_contact(body: ContactCredentialsDTO, bookingid: str):
    print(body, bookingid)
    result = booking.read_unscheduled_events_for_contact(bookingid, body)
    if result is None: raise HTTPException(status_code=401, detail="access denied")
    return result