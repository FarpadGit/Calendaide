from typing import Annotated
from fastapi import APIRouter, HTTPException, Header
from services import users, sessions
from dto import Credentials, OauthCredentials, EncryptedData, LoginUserData, User
from utils.decryption import decrypt

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginUserData)
async def login(encrypted: EncryptedData):
    decripted_data = decrypt(encrypted.key, encrypted.ciphertext, encrypted.iv)
    credentials = Credentials.model_validate_json(decripted_data)
    print(credentials)
    if not credentials.email or not credentials.password:
        raise HTTPException(status_code=400, detail="Missing username or password")
    
    userdata = users.get_user_data(credentials=credentials)
    if userdata is None: raise HTTPException(status_code=401, detail="incorrect credentials")

    session_id = sessions.create_session(userdata["user"]["id"])
    return { **userdata, "token": session_id }

@router.post("/login/google", response_model=LoginUserData)
async def login_with_google(encrypted: EncryptedData):
    decripted_data = decrypt(encrypted.key, encrypted.ciphertext, encrypted.iv)
    oauth_credentials = OauthCredentials.model_validate_json(decripted_data)
    print(oauth_credentials)
    userdata = users.get_user_data(oauth_credentials=oauth_credentials)
    if userdata is None:
        new_user = User(email=oauth_credentials.email, token=oauth_credentials.token, displayname=oauth_credentials.displayname)
        success = users.create_user(new_user)
        if not success: raise HTTPException(status_code=403, detail="User with email already exists")
        userdata = users.get_user_data(oauth_credentials=oauth_credentials)
    
    session_id = sessions.create_session(userdata["user"]["id"])
    return { **userdata, "token": session_id }

@router.post("/register")
async def register(encrypted: EncryptedData):
    decripted_data = decrypt(encrypted.key, encrypted.ciphertext, encrypted.iv)
    credentials = Credentials.model_validate_json(decripted_data)
    print(credentials)
    if not credentials.email or not credentials.password:
        raise HTTPException(status_code=400, detail="Missing username or password")
    new_user = User(email=credentials.email, passwordHash=credentials.password, displayname=credentials.email)
    success = users.create_user(new_user)
    if not success: raise HTTPException(status_code=403, detail="User with email already exists")

@router.post("/refresh")
async def refresh(session_header: Annotated[str | None, Header(alias="Authorization")] = None):
    user_id = sessions.get_user_in_session(session_header)
    userdata = users.get_user_data(user_id=user_id)
    if userdata: return userdata
    else: raise HTTPException(status_code=500, detail="refresh failed")

@router.post("/logout")
async def logout(session_header: Annotated[str | None, Header(alias="Authorization")] = None):
    sessions.delete_session(session_header)