from typing import Annotated
from fastapi import APIRouter, HTTPException, Header
from dto import ContactDTO
from services import contacts, sessions

router = APIRouter(prefix="/contacts", tags=["Contacts"])

@router.post("/", status_code=201)
async def create_contact(body: ContactDTO, session_header: Annotated[str | None, Header(alias="Authorization")] = None):
    print(body)
    user_id = sessions.get_user_in_session(session_header)
    id = contacts.create_contact(user_id, body)
    if not id: raise HTTPException(status_code=400)
    return id

@router.put("/{contactid}", status_code=200)
async def update_contact(contactid: str, body: ContactDTO, session_header: Annotated[str | None, Header(alias="Authorization")] = None):
    print(contactid, body)
    user_id = sessions.get_user_in_session(session_header)
    body.id = contactid
    contacts.update_contact(user_id, body)

@router.delete("/{contactid}", status_code=204)
async def delete_contact(contactid: str, session_header: Annotated[str | None, Header(alias="Authorization")] = None):
    print(contactid)
    user_id = sessions.get_user_in_session(session_header)
    contacts.delete_contact(user_id, contactid)