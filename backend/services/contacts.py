from db import db, Contact
from dto import ContactDTO, Undefined
from utils.converters import trimmed_dict, DTO_to_Contact
from pymongo.collection import ObjectId

def create_contact(user_id: str, contact: ContactDTO) -> str | None:
   if contact.name == Undefined: return None
   _contact = DTO_to_Contact(contact)
   _contact_dict = trimmed_dict(Contact.model_dump(_contact))
   db.users.update_one({"_id": ObjectId(user_id)}, {"$push": {"contacts": _contact_dict}})
   return _contact.id

def update_contact(user_id: str, contact: ContactDTO):
   db_user = db.users.find_one({"_id": ObjectId(user_id)})
   if not db_user: return

   db_contacts = [c for c in db_user["contacts"] if c["id"] == contact.id]
   if db_contacts.__len__() != 1: return
   
   _contact = Contact.model_validate(db_contacts[0])

   if contact.name != Undefined: _contact.name = contact.name
   if contact.comment != Undefined: _contact.comment = contact.comment
   if contact.color != Undefined: _contact.color = contact.color

   _contact_dict = trimmed_dict(Contact.model_dump(_contact))
   db.users.update_one({"_id": ObjectId(user_id), "contacts.id": contact.id}, {"$set": {"contacts.$": _contact_dict }})

def delete_contact(user_id: str, contact_id: str):
   db.users.update_one({"_id": ObjectId(user_id)}, {"$pull": {"contacts": {"id": contact_id}}})