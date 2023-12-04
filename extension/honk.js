console.log("Honk honk");

// TODO design:
/*
search body results is a list of collapsible
header is the name with short tags.
body is the form as it is rn

config tab is at bottom, focused if error / empty

bigger ui

better picto for the collapse/expend button
cursor type on header

backgournd color for focus on opened header (wave anim on click ?)

disabled/enabled button style

*/


const host = document.getElementById("host");
const username = document.getElementById("username");
const password = document.getElementById("password");
const tags = document.getElementById("tags");
const results = document.getElementById("result-content");
const errors = document.getElementById("error-content");
const status = document.getElementById("status");
const config_section = document.getElementById("config-section");
const new_record_name = document.getElementById("new-record-name");
const new_record_tags = document.getElementById("new-record-tags");
const new_record_data = document.getElementById("new-record-data");
const create_record_button = document.getElementById("create-record-button");
const create_record_status = document.getElementById("create-record-status");
let headers = {};
const storage = browser.storage.local;
let identity = undefined;
let version = undefined;

Collapse.init();


/* Configuration*/

function display_status(startup) {
  if (version !== undefined && identity !== undefined) {
    status.innerText = `🆗 Ready`;
    Collapse.collapse(config_section);
  }
  else if (version !== undefined) {
    status.innerText = `⚠️ Not Authorized`;
  }
  else {
    status.innerText = `❌ Not Connected`;
  }
}

function host_changed() {
  version = undefined;
  identity = undefined;

  if (host.value == "") {
    display_status();
    return
  }

  fetch(`https://${host.value}/version`).then(response => {
    if (response.ok)
      response.text().then(data => { 
        version = data;
        display_status();
        if (username.value != "" && password.value != "")
          identity_changed();
      })
    else {
      errors.innerText = "Could not fetch the version";
      display_status();
      Collapse.expend(config_section);
    }
  }).catch(response => {
    errors.innerText = "Could not fetch the version";
    display_status();
    Collapse.expend(config_section);
  });
}

// Prehash the password, so it never reach the server. Salt and pepper.
// Needed since this client use the same password for symetryc encryption and account login.
// Raw buffer get completely fucked by various shitty unicode or base64 implem
// so hexing it. Still allowed by a shitty bcrypt implem
function prehash(salt, pepper, password) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}${pepper}${password}`))
  .then(prehash => {
    return [...new Uint8Array(prehash)]
      .map(b => b.toString (16).padStart(2, "0"))
      .join('');
  });
}

function identity_changed() {
  identity = undefined;

  if (version == undefined || username.value == "" || password.value == "") {
    display_status();
    return
  }

  prehash(username.value, "HONK HONK", password.value).then(prehashed => {
  headers["Authorization"] = `Basic ${btoa(`${username.value}:${prehashed}`)}`;
  fetch(`https://${host.value}/user/self`, {headers, mode: "cors"}).then(response => {
      if (response.ok)
        response.json().then(data => { 
          identity = data;
          display_status();
        });
      else {
        errors.innerText = "Could not login";
        display_status();
        Collapse.expend(config_section);
      } 
    }).catch(_ => {
      errors.innerText = "Could not fetch the version";
      display_status();
      Collapse.expend(config_section);
    });
  });
}

Promise.all([
  storage.get("host").then(value => { 
    if (value.host != undefined)
      host.value = value.host;
  }),
  storage.get("username").then(value => { 
    if (value.username != undefined)
      username.value = value.username;
  
  }),
  storage.get("password").then(value => {
    if (value.password != undefined)
      password.value = value.password;
  })
]).then(_ => host_changed())



host.onchange = (e) => { 
    storage.set({host: host.value});
    if (host != "")
        host_changed(e);
};


username.onchange = (e) => { 
    storage.set({username: username.value});
    identity_changed();
};

password.onchange = (e) => { 
    storage.set({password: password.value});
    identity_changed();
};

/* Search records */

tags.onchange = (e) => {
    fetch(`https://${host.value}/passwords?${tags.value}`, {headers}).then(response => {
        if (response.ok) {
            response.json().then(data => results.replaceChildren(...(data.map(render_entry))) );
        } else 
            response.json().then(data => {errors.innerHtml = data.error; });      
    });
};

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
    const actions =  document.createElement("div");
    const edit = document.createElement("button");
    const remove = document.createElement("button");
    let deciphered = false;

    name.value = entry.name;
    tags.value = entry.tags.join(' ');
    data.value = "Deciphering....";
    edit.innerText = "Save changes";
    edit.disabled = true;
    remove.innerText = "Remove";

    actions.classList.add("flex-row")
    actions.classList.add("spread")
    actions.replaceChildren(edit, remove);
    container.replaceChildren(name, tags, data, actions);
    
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

    container.classList.add("record-entry");

    return container;
};


/* Create new records */

function new_record_change() {
  if (new_record_name.value == "" || new_record_tags.value == "")
    create_record_button.disabled = true;
  else
    create_record_button.disabled = false;
};

new_record_name.onchange = new_record_change;
new_record_tags.onchange = new_record_change;

create_record_button.onclick = event => {
  create_record_status.innerText = `....`; // LOADER
  encrypt(new_record_data.value, password.value).then(data => {
    const body = {
      name: new_record_name.value,
      tags: new_record_tags.value.split(" "),
      data
    };
    fetch(`https://${host.value}/password`, {method: "POST", headers, body: JSON.stringify(body)}).then(response => {
      if (response.ok)
        create_record_status.innerText = `🆗 created`;
      else 
        response.json().then(data => {
          create_record_status.innerText = `❌ ${data.error}`;
        });      
    }).catch(error => {
      create_record_status.innerText = `❌ ${error}`;
    });
  });
};