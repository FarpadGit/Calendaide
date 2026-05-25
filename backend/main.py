from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from controllers import auth, users, contacts, events

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Authorization"],
)

@app.get("/")
def root():
    return Response(status_code=200)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(contacts.router)
app.include_router(events.router)