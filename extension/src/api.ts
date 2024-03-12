import {prehash} from './utils/crypto'
import {EventEmitter} from 'events'

enum Category {
    Network = "network",
    Authentication = "authentication"
}

type Error = {
    kind: Category 
    details: string
};

/**
 * Repository for interaction with the API.
 */
export default class Api extends EventEmitter {
    static ErrorCategory = Category

    #isReady = false
    #hostname = ''
    #headers = new Headers();

    selfTest(hostname: string, username: string, password: string): Promise<string> {
        this.#hostname = hostname;
        
        return prehash(username, "HONK HONK", password)
        .then(hash => {
            this.#headers.set('Authorization', `Basic ${btoa(`${username}:${hash}`)}`)            
            return this.status().then(status => {
                return this.self().then(() => {
                    this.#isReady = true;
                    this.emit("ready");
                    return status
                })
            });
        })
    }

    get isReady(): boolean {
        return this.#isReady
    }

    self(): Promise<object> {
        return fetch(
            `https://${this.#hostname}/users/self`, 
            {headers: this.#headers, mode: "cors"}
        ).then(response => {
            if (response.ok)
                return response.json()
            else return Promise.reject({kind: Category.Authentication, details: null})
        })
    }

    status() : Promise<string> {
        return fetch(`https://${this.#hostname}/version`)
        .then(response => {
            if (response.ok)
                return response.text()
            return Promise.reject({kind: Category.Network, details: null})
        })
    }
}