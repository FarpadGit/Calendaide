import json
from typing import Annotated
from fastapi import APIRouter, Header
from dto import EncryptedData, UserModifiableDTO, CalendarData
from services import users, events, sessions
from utils.decryption import decrypt

router = APIRouter(prefix="/users", tags=["Users"])

@router.put("/", status_code=200)
async def update_user(encrypted: EncryptedData, session_header: Annotated[str | None, Header(alias="Authorization")] = None):
    decripted_data = decrypt(encrypted.key, encrypted.ciphertext, encrypted.iv)
    body = UserModifiableDTO.model_validate(json.loads(decripted_data))
    print(body)
    user_id = sessions.get_user_in_session(session_header)
    users.update_user(user_id, body)

@router.delete("/", status_code=204)
async def delete_user(session_header: Annotated[str | None, Header(alias="Authorization")] = None):
    user_id = sessions.get_user_in_session(session_header)
    print(user_id)
    events.delete_all_events_for_user(user_id)
    users.delete_user(user_id)

@router.post("/userdata", status_code=200)
async def save_calendar_data(body: CalendarData, session_header: Annotated[str | None, Header(alias="Authorization")] = None):
    print(body)
    user_id = sessions.get_user_in_session(session_header)
    users.set_user_data(user_id, body)