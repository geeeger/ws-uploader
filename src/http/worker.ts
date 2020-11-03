import * as Interface from "../interface";
import { HttpClientProps } from "../interface";
import { guid } from "../core/utils";
import HttpClient from "./base";

/**
 * @description worker http服务
 * @export
 * @class HttpWorker
 * @extends {HttpClient}
 * @implements {Interface.HttpClient}
 */
export default class HttpWorker extends HttpClient implements Interface.HttpClient {
    /**
     * 服务提供实例
     *
     * @type {Interface.WorkersProvider}
     * @memberof HttpWorker
     */
    public workers: Interface.WorkersProvider;

    /**
     * 消息频道
     *
     * @type {string}
     * @memberof HttpWorker
     */
    public channel: string;

    /**
     * Creates an instance of HttpWorker.
     * @param {{
     *         workers: Interface.WorkersProvider;
     *     }} opts
     * @memberof HttpWorker
     */
    constructor(opts: {
        workers: Interface.WorkersProvider;
    }) {
        super();
        this.workers = opts.workers;
        this.channel = guid();
    }

    /**
     * 发送请求
     *
     * @template T
     * @param {HttpClientProps} props
     * @param {*} [{ isTransferSupported, isEmitEvent }={}]
     * @return {*}  {Promise<T>}
     * @memberof HttpWorker
     */
    public post<T>(props: HttpClientProps, { isTransferSupported, isEmitEvent }: any = {}): Promise<T> {
        return new Promise((resolve, reject): void => {
            const channel = guid();
            this.workers.on(channel, (payload: any): void => {
                if (payload.type === 'error') {
                    this.workers.removeAllListeners(channel);
                    reject(payload.data);
                }
                if (payload.type === 'progress') {
                    isEmitEvent && this.emit('UpdateProgress', payload.data);
                }
                else {
                    this.workers.removeAllListeners(channel);
                    resolve(payload.data);
                }
            });
            const opts = isTransferSupported ? {
                transfer: [props.data]
            } : undefined;
            this.workers.send({
                channel: channel,
                payload: props,
            }, opts)
        });
    }
}
