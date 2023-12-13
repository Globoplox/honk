function atoh(data) {
  return [...new Uint8Array(data)].map(b => b.toString (16).padStart(2, "0")).join('');
}

function htoa(h) {
  return Uint8Array.from(h.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

function derive_key(password, salt) {
  return crypto.subtle.importKey(
    "raw", 
    password, 
    "PBKDF2", 
    false, 
    ["deriveBits", "deriveKey"]
  ).then(key => {
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
  })
}

export function encrypt(text, password) {
  const data = new TextEncoder().encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  return derive_key(
    new TextEncoder().encode(password),
    salt
  ).then(aes_key => {
    return crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes_key, data);
  }).then(cipher => {
    return JSON.stringify({
      data: atoh(cipher), 
      iv: atoh(iv), 
      salt: atoh(salt)
    });
  }).catch(err => { 
    console.log(err);
    throw err;
  });
}

export function decrypt(cipher, password) {
  const {data, iv, salt} = JSON.parse(cipher);
  
  return derive_key(
    new TextEncoder().encode(password), 
    htoa(salt)
  ).then(aes_key => {
    return crypto.subtle.decrypt(
      { name: "AES-GCM", 
        iv: htoa(iv) }, 
      aes_key, 
      htoa(data)
    ).then(text => {
      return new TextDecoder().decode(text); 
    }).catch(err => { 
      console.log(err);
      throw err;
    });
  }).catch(err => { 
    console.log(err);
    throw err;
  });
}
