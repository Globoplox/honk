import {prehash, decrypt, encrypt} from './utils/crypto'
import {EventEmitter} from 'events'

type Error = {
    error: string
    details: string
};

export type User = {
    id: string,
    name: string,
    created_at: string,
}

type PasswordId = string

export type Password = {
    id: PasswordId,
    name: string,
    tags: Array<string>,
    data: string
    deciphered: Promise<string>
    created_at: string,
    updated_at: string
};

/**
 * Repository for interaction with the API.
 * It emit `ready` when it configuration allows.
 *
 * TODO:
 * - [ ] Better error handling (lot of missing details)
 * - [ ] Do not relaunch status fetch if hostname is the same in selftest
 */
export default class Api extends EventEmitter {
    hostname: string
    username: string
    password: string

    constructor() {
        super()
        this.hostname = localStorage.getItem("hostname")
        this.username = localStorage.getItem("username")
        this.password = localStorage.getItem("password")
    }

    #isReady = false
    #headers = new Headers({'content-type': 'application/json'})
    
    selfTest(hostname: string, username: string, password: string): Promise<{status: string | Error, user: object | Error}> {
        this.hostname = hostname
        this.username = username
        this.password = password
        
        return prehash(username, "HONK HONK", password)
        .then(hash => {
            this.#headers.set('Authorization', `Basic ${btoa(`${username}:${hash}`)}`)            
            return this.status().then(status => {
                return this.self().then(user => {
                    this.#isReady = true;
                    this.emit("ready");
                    return {status, user}
                }).catch(e => {
                    return {status, user: e}
                })
            }).catch(e => { 
                return {status: e, user: null}
            })
        })
    }

    get isReady(): boolean {
        return this.#isReady
    }

    // TODO: use raw error from navigator and put the toString at top level
    // Promise errors are simply impossible to type correctly.
    mapNetworkError(error: unknown): Promise<any> {
        return Promise.reject({error: "Network error", details: error.toString()})
    }

    self(): Promise<User> {
        return fetch(
            `https://${this.hostname}/login`, 
            {headers: this.#headers}
        ).then(response => {
            if (response.ok)
                return response.json()
            else return response.json().then(_ => Promise.reject(_))
        }, this.mapNetworkError)
    }

    status() : Promise<string> {
        return fetch(`https://${this.hostname}/version`)
        .then(response => {
            if (response.ok)
                return response.text()
            else 
                return response.json().then(_ => Promise.reject(_))
            
        }, this.mapNetworkError)
    }

    search(query: string): Promise<Array<Password>> {
        return fetch(
            `https://${this.hostname}/passwords?search=${query}`,
            {headers: this.#headers}
        ).then(response => {
            if (response.ok)
                return response.json().then(entries => {
                    entries.forEach((entry: Password) => {
                        entry.deciphered = decrypt(entry.data, this.password)
                    })
                    return entries
                })
            else 
                return response.json().then(_ => Promise.reject(_))
        }, this.mapNetworkError)
    }



    create(name: string, tags: Array<string>, data: string): Promise<boolean> {
        return encrypt(data, this.password).then(data => {
            const body = {
              name: name,
              tags: tags,
              data
            };

            return fetch(
                `https://${this.hostname}/passwords`, 
                {method: "POST", headers: this.#headers, body: JSON.stringify(body)}
            ).then(response => {
              if (response.ok)
                return true
              else 
                  return response.json().then(_ => Promise.reject(_))
            })
          }, this.mapNetworkError)
    }

    delete(id: PasswordId): Promise<boolean> {
        return fetch(
            `https://${this.hostname}/passwords/${id}`, 
            {method: "DELETE", headers: this.#headers}
        ).then(response => {
            if (response.ok)
                return true
            else 
                return response.json().then(_ => Promise.reject(_))
        }, this.mapNetworkError)
    }

    update(id: PasswordId, name: string, tags: Array<string>, data: string): Promise<boolean> {
        return encrypt(data, this.password).then(data => {
            const body = {
              name: name,
              tags: tags,
              data
            };

            return fetch(
                `https://${this.hostname}/passwords/${id}`, 
                {method: "PUT", headers: this.#headers, body: JSON.stringify(body)}
            ).then(response => {
              if (response.ok)
                return true
              else 
                  return response.json().then(_ => Promise.reject(_))
            })
          }, this.mapNetworkError)
    }

}