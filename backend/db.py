import os
from dotenv import load_dotenv
from upstash_redis import Redis
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, field_serializer
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from pymongo.collection import ObjectId

load_dotenv()

MONGO_USERNAME = os.getenv("MONGO_USERNAME")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_HOST = os.getenv("MONGO_HOST")
MONGO_DB = os.getenv("MONGO_DB")
REDIS_TOKEN = os.getenv("REDIS_TOKEN")
REDIS_URL = os.getenv("REDIS_URL")

try:
  client = MongoClient(f"mongodb+srv://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_HOST}/{MONGO_DB}", server_api=ServerApi("1"))
  db = client[MONGO_DB]
  redis = Redis(url=REDIS_URL, token=REDIS_TOKEN)
  db.events.create_index("start", expireAfterSeconds= 30 * 24 * 60 * 60, partialFilterExpression= { "type": "single" })
  db.events.create_index("expiresAt", expireAfterSeconds=0)
except Exception as e:
  print(f"Database connection exception: {e}")

class Event(BaseModel):
  clientid: str
  type: str
  title: str
  allDay: Optional[bool] = None
  start: Optional[datetime] = None
  end: Optional[datetime] = None
  expiresAt: Optional[datetime] = None

  class RecurrenceData(BaseModel):
    class RRule(BaseModel):
      freq: str
      interval: int
      bymonthday: Optional[list[int]] = None
      byweekday: Optional[list[int]] = None
      dtstart: str
      until: Optional[str] = None
    
    groupId: str
    rrule: RRule

  recurrenceData: Optional[RecurrenceData] = None
  comment: Optional[str] = None
  contactid: str
  userid: str

class Contact(BaseModel):
  id: str
  name: str
  comment: Optional[str] = None
  color: Optional[str] = None

class User(BaseModel):
  # MongoDB field _id: ObjectId <--> Pydantic field id: str
  # id is optional so mongodb can autogenerate it when new user is inserted
  id: Optional[str] = Field(validation_alias="_id", serialization_alias="_id", exclude=True, default=None)
  @field_validator("id", mode="before")
  def to_str(_id: ObjectId): return str(_id)
  @field_serializer("id", mode="plain")
  def to_object_id(self, id: str | None): return ObjectId(id)

  email: str
  passwordHash: Optional[str] = None
  token: Optional[str] = None
  displayname: str

  class UserSettings(BaseModel):
    saveMode: Optional[str] = None
  
  settings: Optional[UserSettings] = None
  contacts: list[Contact] = []

class Session(BaseModel):
  sessionid: str
  userid: str
  ttl: datetime