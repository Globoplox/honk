
/**
 * Add a delay to event that get cancelled when it is overriden.
 * Use case are real time input that start a process when the user is done
 * typing.
 * TODO: remove and use effects instead.
 */
export default class RTInput {
    #handler: () => void
    #delay: number
    #process: ReturnType<typeof setTimeout>

    /**
     * @param handler the operation to delay
     * @param delay the delay in ms
     */
    constructor(handler: () => void = null, delay_ms: number = 1000) {
        this.#handler = handler
        this.#delay = delay_ms
    }

    schedule(handler: () => void): RTInput {
        if (handler !== undefined)
            this.#handler = handler
        if (this.#process !== null)
            clearTimeout(this.#process)
        this.#process = setTimeout(this.#handler, this.#delay);
        return this
    }
}