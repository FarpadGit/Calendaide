from typing import Annotated
from fastapi import APIRouter, Header
from dto import EventsDTO
from services import events, sessions

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("/", status_code=201)
async def create_events(body: EventsDTO, session_header: Annotated[str | None, Header(alias="Authorization")] = None):
    print(body, session_header)
    user_id = sessions.get_user_in_session(session_header)
    events.create_events(user_id, body.events)

@router.put("/", status_code=200)
async def update_events(body: EventsDTO, session_header: Annotated[str | None, Header(alias="Authorization")] = None):
    print(body)
    user_id = sessions.get_user_in_session(session_header)
    events.update_events(user_id, body.events)

@router.delete("/", status_code=204)
async def delete_events(body: EventsDTO, session_header: Annotated[str | None, Header(alias="Authorization")] = None):
    print(body)
    user_id = sessions.get_user_in_session(session_header)
    events.delete_events(user_id, list(map(lambda e: e.id, body.events)))
