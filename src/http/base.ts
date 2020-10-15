import { EventEmitter } from "events";

/**
 * @description 基类
 * @export
 * @class HttpClient
 * @extends {EventEmitter}
 */
export default class HttpClient extends EventEmitter {
    static Events = {
        UpdateProgress: 'UpdateProgress'
    }
    constructor() {
        super();
    }
}