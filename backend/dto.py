from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from db import User, Event

class Undefined:
    pass

class Credentials(BaseModel):
    email: str
    password: str

class OauthCredentials(BaseModel):
    email: str
    displayname: str
    token: str

class EncryptedData(BaseModel):
    key: str
    ciphertext: str
    iv: str

class UserDTO(BaseModel):
    id: Optional[str] = Undefined
    email: Optional[str] = Undefined
    displayname: Optional[str] = Undefined
    settings: Optional[User.UserSettings] = Undefined

class UserModifiableDTO(BaseModel):
    displayname: Optional[str] = Undefined
    settings: Optional[User.UserSettings] = Undefined
    password: Optional[str] = Undefined

class ContactDTO(BaseModel):
    id: Optional[str] = Undefined
    name: Optional[str] = Undefined
    comment: Optional[str] = Undefined
    color: Optional[str] = Undefined

class EventDTO(BaseModel):
    id: str
    type: Optional[str] = Undefined
    title: Optional[str] = Undefined
    allDay: Optional[bool] = Undefined
    start: Optional[datetime] = Undefined
    end: Optional[datetime] = Undefined
    recurrenceData: Optional[Event.RecurrenceData] = Undefined
    comment: Optional[str] = Undefined
    contactId: Optional[str] = Undefined

class EventsDTO(BaseModel):
    events: list[EventDTO]

class CalendarData(BaseModel):
    user: UserDTO
    contacts: list[ContactDTO]
    events: list[EventDTO]

class LoginUserData(CalendarData):
    token: str