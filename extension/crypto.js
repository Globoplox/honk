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

function encrypt(text, password) {
    const data = new TextEncoder().encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    
    return derive_key( 
        new TextEncoder().encode(password),
        salt
    ).then(aes_key => {
        return crypto.subtle.decrypt({ name: "AES-GCM", iv }, aes_key, data);
    }).then(cipher => {
        return JSON.stringify({
            data: new TextDecoder().decode(cipher), 
            iv: new TextDecoder().decode(iv), 
            salt: new TextDecoder().decode(salt)
        });
    });;
}

function decrypt(cipher, password) {
    const {data, iv, salt} = JSON.parse(cipher);

    return derive_key(
        new TextEncoder().encode(password), 
        new TextEncoder().encode(salt)
    ).then(aes_key => {
        return crypto.subtle.decrypt(
            {   name: "AES-GCM", 
                iv: new TextEncoder().encode(iv) }, 
            key, 
            cipher
        ).then(text => {
            return new TextDecoder().decode(text); 
        });
    });
}