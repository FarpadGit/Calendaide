import uuid
from db import redis
from fastapi import HTTPException

session_ttl_seconds = 24 * 60 * 60

def create_session(user_id: str):
   session_id = uuid.uuid4()
   redis.set(key=f"calendar_session_{session_id}", value=user_id, ex=session_ttl_seconds)
   return str(session_id)

def get_user_in_session(header: str | None):
   if not header: return None
   session_id = header.removeprefix("Bearer ")
   user_id = redis.get(f"calendar_session_{session_id}")
   if not user_id: raise HTTPException(status_code=403, detail="Unauthorized session")
   redis.set(key=f"calendar_session_{session_id}", value=user_id, ex=session_ttl_seconds)
   return user_id

def delete_session(header: str | None):
   if not header: return None
   session_id = header.removeprefix("Bearer ")
   redis.delete(f"calendar_session_{session_id}")