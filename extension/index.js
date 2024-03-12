import * as Collapse from "./collapse";
import * as Crypto from "./src/utils/crypto";
import {jsx} from "./jsx/jsx-runtime";

console.log("Honk honk");

class Test {
  jsx(...params) {
    console.log("CALLED THE SCOPED JSX !");
    console.log(...params);
  }

  jsxs(...params) {
    jsx(params)
  }

  some_property = "form" 

  dothing() {
    console.log(<some_property stuff="truc">Hallo</some_property>);
  }
}

new Test().dothing();

const host = document.getElementById("host");
const username = document.getElementById("username");
const password = document.getElementById("password");
const tags = document.getElementById("tags");
const results = document.getElementById("result-content");
const errors = document.getElementById("error-content");
const status = document.getElementById("status");
const config_section = document.getElementById("config-section");
const search_section = document.getElementById("search-section");
const new_record_name = document.getElementById("new-record-name");
const new_record_tags = document.getElementById("new-record-tags");
const new_record_data = document.getElementById("new-record-data");
const create_record_button = document.getElementById("create-record-button");
const create_record_status = document.getElementById("create-record-status");
const no_result_found = document.getElementById("no-result-found");

let headers = {};
const storage = browser.storage.local;
let identity = undefined;
let version = undefined;

function prefill() {
  browser.tabs.query({currentWindow: true, active: true}).then(tabs => {
    if (tabs && tabs.length > 0) {
      const url = new URL(tabs[0].url);

      if (url.hostname) {
        const parts = url.hostname.split(".");
        if (!parts[parts.length - 1] != "lan")
          parts.pop(); // Remove TLD unless it's lan.
        new_record_name.value = parts.join("-");
        new_record_tags.value = parts.join(" ");
        tags.value = parts.join(" ");
        tags?.onchange();
      }
    }
  });  
}

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

/*
 * Prehash the password, so it never reach the server. Salt and pepper.
 * Needed since this client use the same password for symetryc encryption and account login.
 * Raw buffer get completely fucked by various shitty unicode or base64 implem
 * so hexing it. Still allowed by a shitty bcrypt implem
*/
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
  fetch(`https://${host.value}/users/self`, {headers, mode: "cors"}).then(response => {
      if (response.ok)
        response.json().then(data => { 
          identity = data;
          display_status();
          prefill();
          errors.innerText = "";
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
    else
      Collapse.expend(config_section);
  }),
  storage.get("username").then(value => { 
    if (value.username != undefined)
      username.value = value.username;
    else
      Collapse.expend(config_section);
    
  }),
  storage.get("password").then(value => {
    if (value.password != undefined)
      password.value = value.password;
    else
      Collapse.expend(config_section);
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

tags.oninput = (e) => {
    fetch(`https://${host.value}/passwords?search=${tags.value}`, {headers}).then(response => {
        if (response.ok) {
            response.json().then(data => { 
              if (data.length == 0) {
                results.replaceChildren(no_result_found);
              } else {
                const childrens = data.map(render_entry);
                results.replaceChildren(...childrens);
                // Re-init after adding elements.
                Collapse.init();
                if (childrens.length == 1) {
                  // If there is only one result, expend it
                  Collapse.expend(childrens[0]); 
                }
              }
              Collapse.expend(search_section);
            });
        } else 
            response.json().then(data => {errors.innerHtml = data.error; });      
    });
};

tags.onkeydown = (e) => {
  if (tags.value == "" && e.keyCode == 13)
    tags.oninput();
};


function save_password(id, data) {

}

function remove_password(id) {
  return fetch(`https://${host.value}/passwords/${id}`, {method: "DELETE", headers}).then(response => {
    if (response.ok) {
      // Some kind of ui validation that it worked
      errors.innerText = '';
    } else 
      response.json().then(data => {
        errors.innerText = `❌ ${data.error}`;
      });      
  }).catch(error => {
    errors.innerText = error;
  });
}

// Went completely overkill with jsx but it's fun.
// Their is only a jsx syntax transformer, no reactive store  nor virtual dom.
// So I keep ref to elements of the dom tree that requires changes and update them the old way.
function render_entry(entry) {
  const refs = {};
  let edit;
  let name;
  let tags;
  let data;
  let deciphered = false;

  const onchange = event => {
    refs.edit.disabled = false;
  };

  const onedit = event => {
      if (deciphered) {
          Crypto.encrypt(refs.data.value, password.value).then(data => {
            save_password(entry.id, {data, name: refs.name.values, tags: refs.tags.value.split(' ')})
              //.then(e => {refs.edit.disabled = true});
          });
      } else {
        save_password(entry.id, {data: entry.data, name: refs.name.values, tags: refs.tags.value.split(' ')})
            //.then(e => {refs.edit.disabled = true});
        }
  };

  const onremove = event => {
      remove_password(entry.id).then(() => {
        const existing = document.getElementById(`search-password-${entry.id}`);
        if (existing)
          existing.remove();
      });
  };

  Crypto.decrypt(entry.data, password.value).then(text => {
    refs.data.value = text; 
    refs.data.oninput = onchange;
    refs.deciphered = true;
  });

  return <li id={`search-password-${entry.id}`} class="collpased">
    <div class="collapsible-header collapse-button">
      <div>{entry.name}</div>
      <div>{entry.tags.join(' ')}</div>
    </div>
    <div class="collapsible-body padding-bottom-8">
      {refs.name = <input onchange={onchange} value={entry.name}/>}
      {refs.tags = <input onchange={onchange} value={entry.tags.join(' ')}/>}
      {refs.data = <textarea>Deciphering....</textarea>}
      <div class="flex-row spread">
        {refs.edit = <button onclick={onedit} disabled>Save changes</button>}
        <button onclick={onremove}>Remove</button>
      </div>
    </div>
  </li>;
};

/* Create new records */

function new_record_change() {
  if (new_record_name.value == "" || new_record_tags.value == "" || new_record_data.value == "")
    create_record_button.disabled = true;
  else
    create_record_button.disabled = false;
};

new_record_name.onchange = new_record_change;
new_record_tags.onchange = new_record_change;
new_record_data.onchange = new_record_change;

create_record_button.onclick = event => {
  create_record_status.innerText = `....`; // LOADER
  Crypto.encrypt(new_record_data.value, password.value).then(data => {
    const body = {
      name: new_record_name.value,
      tags: new_record_tags.value.split(" "),
      data
    };
    fetch(`https://${host.value}/passwords`, {method: "POST", headers, body: JSON.stringify(body)}).then(response => {
      if (response.ok) {
        create_record_status.innerText = `🆗 created`;
        create_record_status.innerText = '';
      } else 
        response.json().then(data => {
          create_record_status.innerText = `❌ ${data.error}`;
        });      
    }).catch(error => {
      create_record_status.innerText = `❌ ${error}`;
    });
  });
};
