import {prehash, decrypt} from './utils/crypto'
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

export type Password = {
    id: string,
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

    #isReady = false
    #hostname = ''
    #password: string = null
    #headers = new Headers()

    selfTest(hostname: string, username: string, password: string): Promise<{status: string | Error, user: object | Error}> {
        this.#hostname = hostname
        this.#password = password
        
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

    self(): Promise<User> {
        return fetch(
            `https://${this.#hostname}/users/self`, 
            {headers: this.#headers, mode: "cors"}
        ).then(response => {
            if (response.ok)
                return response.json()
            else return response.json().then(_ => Promise.reject(_))
        })
    }

    status() : Promise<string> {
        return fetch(`https://${this.#hostname}/version`)
        .then(response => {
            if (response.ok)
                return response.text()
            else 
                return response.json().then(_ => Promise.reject(_))
            
        })
    }

    search(query: string): Promise<Array<Password>> {
        return fetch(
            `https://${this.#hostname}/passwords?search=${query}`,
            {headers: this.#headers, mode: "cors"}
        ).then(response => {
            if (response.ok)
                return response.json().then(entries => {
                    entries.forEach((entry: Password) => {
                        entry.deciphered = decrypt(entry.data, this.#password)
                    })
                    return entries
                })
            else 
                return response.json().then(_ => Promise.reject(_))
        })
    }
}