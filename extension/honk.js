console.log("Honk honk");

const host = document.getElementById("host");
const username = document.getElementById("username");
const password = document.getElementById("password");
const tags = document.getElementById("tags");
const results = document.getElementById("result-content");
const errors = document.getElementById("error-content");
let headers = {};
const storage = browser.storage.local;

function authorize() {
    headers["Authorization"] = `Basic ${btoa(`${username.value}:${password.value}`)}`;
}
headers["Content-Type"] = "zfaezfazf";

storage.get("host").then(value => { 
    if (value.host != undefined)
        host.value = value.host;
});

storage.get("username").then(value => { 
    if (value.username != undefined) {
        username.value = value.username;
        authorize();
    }
});

storage.get("password").then(value => {
    if (value.password != undefined) {
        password.value = value.password;
        authorize();
    }
});

host.onchange = (e) => { 
    storage.set({host: host.value});
};

username.onchange = (e) => { 
    storage.set({username: username.value});
    authorize();
};

password.onchange = (e) => { 
    storage.set({password: password.value});
    headers["Authorization"] = `Basic ${btoa(`${username.value}:${password.value}`)}`;
    authorize();
};

tags.onchange = (e) => {
    console.log(JSON.stringify(headers));
    fetch(`${host.value}/passwords?${tags.value}`, {headers, mode: "cors"}).then(response => {
        if (response.ok)
            response.json().then(data => results.replaceChildren(data.map(render_entry)));
        else 
            response.json().then(data => {errors.innerHtml = data.error; });      
    });
};

// Todo Create user button
// Todo prehash password before sending, do it safely ig

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

function save_password(id, data) {

}

function remove_password(id) {

}

function render_entry(entry) {
    const container = createElement("div");
    const name = createElement("input");
    const tags = createElement("input");
    const data = createElement("textarea");
    const edit = createElement("button");
    const remove = createElement("button");
    let deciphered = false;

    name.value = entry.name;
    tags.value = entry.tags.join(' ');
    data.value = "Deciphering....";
    edit.innerText = "Save changes";
    edit.disabled = true;
    remove.innerText = "Remove";

    container.replaceChildren({
        name, tags, data, edit, remove
    });
    
    const onchange = event => {
        edit.disabled = false;
    };

    name.onchange = onchange;
    tags.onchange = onchange;

    decrypt(entry.data, password.value).then(text => {
        data.value = text; 
        data.onchange = onchange;
        deciphered = true;
    });

    edit.onclick = event => {
        if (deciphered) {
            encrypt(data.value, password.value).then(data => {
                save_password(entry.id, {data, name: name.values, tags: tags.value.split(' ')});
            });
        } else {
            save_password(entry.id, {data: entry.data, name: name.values, tags: tags.value.split(' ')});
        }
    };

    remove.onclick = event => {
        remove_password(entry.id).then(() => {
            // Todo Remove self from parent
        });
    };

    return container;
};