async function generateKey(encodedData: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>) {
  const keyMaterial = await crypto.subtle.importKey('raw', encodedData, { name: 'PBKDF2' }, false, [
    'deriveBits',
    'deriveKey',
  ]);

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt'],
  );
}

export async function encrypt(data: string) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await generateKey(encodedData, salt);
  const keyBuffer = await crypto.subtle.exportKey('raw', key);

  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedData);

  const ciphertextBase64: string = btoa(
    String.fromCharCode.apply(null, Array.from(new Uint8Array(ciphertext))),
  );
  const ivBase64: string = btoa(String.fromCharCode.apply(null, Array.from(iv)));
  const keyBase64: string = btoa(
    String.fromCharCode.apply(null, Array.from(new Uint8Array(keyBuffer))),
  );

  return { key: keyBase64, ciphertext: ciphertextBase64, iv: ivBase64 };
}
