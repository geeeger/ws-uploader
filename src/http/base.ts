import { EventEmitter } from "events";

export default class HttpClient extends EventEmitter {
    static Events = {
        UpdateProgress: 'UpdateProgress'
    }
    constructor() {
        super();
    }
}