import Interface, { HttpClientProps } from "../../types/interface";
import { guid, isObject } from "../core/utils";
import { AxiosResponse } from "axios";
import HttpClient from "./base";

export default class HttpWorker extends HttpClient implements Interface.HttpClient {
    public workers: Interface.WorkersProvider;
    public channel: string;

    constructor(opts: {
        workers: Interface.WorkersProvider
    }) {
        super();
        this.workers = opts.workers;
        this.channel = guid();
    }

    public post<T>(props: HttpClientProps, { isTransferSupported, isEmitEvent }: any = {}): Promise<AxiosResponse<T>> {
        this.workers.removeMessagesByChannel(this.channel);
        this.workers.removeAllListeners(this.channel);
        return new Promise((resolve, reject): void => {
            this.workers.on(this.channel, (error: any, payload: any): void => {
                if (error) {
                    this.workers.removeAllListeners(this.channel);
                    reject(new Error(error));
                }
                if (isObject(payload) && payload.type === 'process') {
                    isEmitEvent && this.emit('UpdateProgress', payload.data);
                }
                else {
                    this.workers.removeAllListeners(this.channel);
                    resolve(payload);
                }
            });
            const transfer = [];
            if (isTransferSupported) {
                transfer.push(props.data);
            }
            this.workers.send({
                channel: this.channel,
                payload: props,
            }, {
                transfer
            })
        });
    }
}
