import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def decrypt(key: str, ciphertext: str, iv: str):
  _key = base64.b64decode(key)
  _iv = base64.b64decode(iv)
  _ciphertext = base64.b64decode(ciphertext)
  decrypted = AESGCM(_key).decrypt(_iv, _ciphertext, None)
  return decrypted.decode("utf-8")