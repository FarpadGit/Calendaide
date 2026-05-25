from argon2 import PasswordHasher
from db import db, User, Contact, Event
from dto import Credentials, OauthCredentials, UserModifiableDTO, CalendarData, Undefined
from pymongo.collection import ObjectId
from utils.converters import trimmed_dict, DTO_to_Contact, DTO_to_Event

def get_user_data(credentials: Credentials = None, oauth_credentials: OauthCredentials = None, user_id: str = None):
   db_user_data = None
   if credentials != None:
      db_user_data = db.users.find_one({"email": credentials.email})
   if oauth_credentials != None:
      db_user_data = db.users.find_one({"email": oauth_credentials.email, "token": oauth_credentials.token})
   if user_id != None: 
      db_user_data = db.users.find_one({"_id": ObjectId(user_id)})
   try:
      if db_user_data is None: raise Exception("user not found in database") 
      if credentials != None: PasswordHasher().verify(db_user_data["passwordHash"], credentials.password)
   except Exception as e: 
      print(str(e))
      return None
   
   user = User.model_validate(db_user_data)

   events = []
   with db.events.find({"userid": str(user.id)}) as cursor:
      for event in cursor: 
         _event = Event.model_validate(event)
         events.append(_event)
    
   return __to_calendar_data(user, events) 

def create_user(user: User):
   db_user = db.users.find_one({"email": user.email})
   if db_user: return False

   new_user = User(
      email= user.email,
      displayname= user.displayname,
      token=user.token,
      contacts= [Contact(id="contact1", name="Egyéb események")]
   )
   if user.passwordHash is not None: new_user.passwordHash = PasswordHasher().hash(user.passwordHash)
   db.users.insert_one(trimmed_dict(User.model_dump(new_user)))
   return True

def update_user(user_id: str, user: UserModifiableDTO):
   db_user = db.users.find_one({"_id": ObjectId(user_id)})
   if not db_user: return
   _user = User.model_validate(db_user)
   
   if user.displayname != Undefined: _user.displayname = user.displayname
   if user.settings != Undefined: _user.settings = user.settings
   if user.password != Undefined: _user.passwordHash = PasswordHasher().hash(user.password)

   set = trimmed_dict(User.model_dump(_user))
   unset = trimmed_dict({
      "settings": "" if user.settings == None else None
   })
   db.users.update_one({"_id": ObjectId(user_id)}, {"$set": set, "$unset": unset})

def delete_user(user_id: str):
   db.users.delete_one({"_id": ObjectId(user_id)})
   
def set_user_data(user_id: str, calendar_data: CalendarData):
   db_user = db.users.find_one({"_id": ObjectId(user_id)})
   if not db_user: return

   user_data = User.model_validate(db_user)
   if calendar_data.user.displayname != Undefined: user_data.displayname = calendar_data.user.displayname
   if calendar_data.user.settings != Undefined: user_data.settings = calendar_data.user.settings

   contacts_data = []
   for contact in calendar_data.contacts:
      _contact = DTO_to_Contact(contact)
      contacts_data.append(_contact)
   user_data.contacts = contacts_data

   db.users.update_one({"_id": ObjectId(user_id)}, {"$set": trimmed_dict(User.model_dump(user_data))})
   db.events.delete_many({"userid": user_id})

   for event in calendar_data.events:
      _event = DTO_to_Event(event, user_id)
      db.events.insert_one(trimmed_dict(Event.model_dump(_event)))


def __to_calendar_data(user: User, events: list[Event]):
   if (not bool(user)): return None
   user_data = {
      "id": str(user.id),
      "email": user.email,
      "displayname": user.displayname,
      "settings": user.settings,
   }
   
   contacts_data = list(map(lambda c: ({
      "id": c.id,
      "name": c.name,
      "color": c.color,
      "comment": c.comment,
      "userId": str(user.id),
      }), user.contacts))
   
   events_data = list()   
   for event in events:
      events_data.append({
         "id": event.clientid,
         "type": event.type,
         "title": event.title,
         "allDay": event.allDay,
         "start": event.start,
         "end": event.end,
         "comment": event.comment,
         "contactId": event.contactid,
         "recurrenceData": Event.RecurrenceData.model_dump(event.recurrenceData) if event.recurrenceData != None else None,
      })
        
   return { "user": user_data, "contacts": contacts_data, "events": events_data }