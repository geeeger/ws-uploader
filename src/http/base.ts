import { EventEmitter } from "events";

/**
 * @description 基类
 * @export
 * @class HttpClient
 * @extends {EventEmitter}
 */
export default class HttpClient extends EventEmitter {
    /**
     * 事件名称
     *
     * @static
     * @memberof HttpClient
     */
    static Events = {
        UpdateProgress: 'UpdateProgress'
    }

    /**
     * Creates an instance of HttpClient.
     * @memberof HttpClient
     */
    constructor() {
        super();
    }
}