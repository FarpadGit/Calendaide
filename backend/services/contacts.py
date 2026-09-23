from db import db, Contact
from dto import ContactDTO, Undefined
from utils.converters import trimmed_dict, DTO_to_Contact
from pymongo.collection import ObjectId

def create_contact(user_id: str, contactDTO: ContactDTO) -> str | None:
   if contactDTO.name == Undefined: return None
   contact = DTO_to_Contact(contactDTO)
   _contact = trimmed_dict(Contact.model_dump(contact))
   db.users.update_one({"_id": ObjectId(user_id)}, {"$push": {"contacts": _contact}})
   return contact.id

def update_contact(user_id: str, contactDTO: ContactDTO):
   db_user = db.users.find_one({"_id": ObjectId(user_id)})
   if not db_user: return

   db_contacts = [c for c in db_user["contacts"] if c["id"] == contactDTO.id]
   if db_contacts.__len__() != 1: return
   
   contact = Contact.model_validate(db_contacts[0])

   if contactDTO.name != Undefined: contact.name = contactDTO.name
   if contactDTO.comment != Undefined: contact.comment = contactDTO.comment
   if contactDTO.color != Undefined: contact.color = contactDTO.color
   if contactDTO.bookingPassword != Undefined: contact.bookingPassword = contactDTO.bookingPassword

   _contact = trimmed_dict(Contact.model_dump(contact))
   db.users.update_one({"_id": ObjectId(user_id), "contacts.id": contactDTO.id}, {"$set": {"contacts.$": _contact }})

def delete_contact(user_id: str, contact_id: str):
   db.users.update_one({"_id": ObjectId(user_id)}, {"$pull": {"contacts": {"id": contact_id}}})