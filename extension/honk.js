console.log("Honk honk");

const host = document.getElementById("host");
const username = document.getElementById("username");
const password = document.getElementById("password");
const tags = document.getElementById("tags");
const results = document.getElementById("result-content");
const errors = document.getElementById("error-content");
const status = document.getElementById("status");
let headers = {};
const storage = browser.storage.local;
let identity = undefined;
let version = undefined;

function display_status() {
  console.log(version, identity);
  if (version !== undefined && identity !== undefined)
    status.innerText = `🆗 Ready`;
  else if (version !== undefined)
    status.innerText = `⚠️ Not Authorized`;
  else 
    status.innerText = `❌ Not Connected`;
}

function host_changed() {
  version = undefined;
  identity = undefined;
  if (host.value == "") {
    display_status();
    return
  }
  fetch(`${host.value}/version`, {mode: "cors"}).then(response => {
    if (response.ok)
      response.text().then(data => { 
        version = data;
        display_status();
        if (username.value != "" && password.value != "")
          identity_changed();
      });
    else {
      errors.innerText = "Could not fetch the version";
      display_status();
    }
  }).catch(response => {
    errors.innerText = "Could not fetch the version";
    display_status();
  });
}

function identity_changed() {
  identity = undefined;
  if (version == undefined || username.value == "" || password.value == "") {
    display_status();
    return
  }
  headers["Authorization"] = `Basic ${btoa(`${username.value}:${password.value}`)}`;
  fetch(`${host.value}/user/self`, {headers, mode: "cors"}).then(response => {
    if (response.ok)
      response.json().then(data => { 
        identity = data;
        display_status();
      });
    else {
      errors.innerText = "Could not login";
      display_status();
    } 
  }).catch(response => {
    errors.innerText = "Could not fetch the version";
    display_status();
  });
}

storage.get("host").then(value => { 
    if (value.host != undefined) {
        host.value = value.host;
        host_changed(value.host);
    }
});

host.onchange = (e) => { 
    storage.set({host: host.value});
    if (host != "")
        host_changed(e);
};

storage.get("username").then(value => { 
    if (value.username != undefined) {
        username.value = value.username;
        identity_changed();
    }
});

storage.get("password").then(value => {
    if (value.password != undefined) {
        password.value = value.password;
        identity_changed();
    }
});

username.onchange = (e) => { 
    storage.set({username: username.value});
    identity_changed();
};

password.onchange = (e) => { 
    storage.set({password: password.value});
    identity_changed();
};


tags.onchange = (e) => {
    console.log(JSON.stringify(headers)); // i removed mode: cors recently
    fetch(`${host.value}/passwords?${tags.value}`, {headers}).then(response => {
        if (response.ok)
            response.json().then(data => results.replaceChildren(data.map(render_entry)));
        else 
            response.json().then(data => {errors.innerHtml = data.error; });      
    });
};

// Todo Create user button
// Todo prehash password before sending, do it safely ig

function save_password(id, data) {

}

function remove_password(id) {

}

function render_entry(entry) {
    const container = document.createElement("div");
    const name = document.createElement("input");
    const tags = document.createElement("input");
    const data = document.createElement("textarea");
    const edit = document.createElement("button");
    const remove = document.createElement("button");
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