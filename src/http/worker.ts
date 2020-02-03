import Interface, { HttpClientProps } from "../../types/interface";
import { guid } from "../core/utils";
import { AxiosResponse } from "axios";
import HttpClient from "./base";

export default class HttpWorker extends HttpClient implements Interface.HttpClient {
    public workers: Interface.WorkersProvider;
    public channel: string;

    constructor(opts: {
        workers: Interface.WorkersProvider;
    }) {
        super();
        this.workers = opts.workers;
        this.channel = guid();
    }

    public post<T>(props: HttpClientProps, { isTransferSupported, isEmitEvent }: any = {}): Promise<AxiosResponse<T>> {
        return new Promise((resolve, reject): void => {
            const channel = guid();
            this.workers.on(channel, (error: any, payload: any): void => {
                if (error) {
                    this.workers.removeAllListeners(channel);
                    reject(new Error(error));
                }
                if (typeof payload === 'object' && payload.type === 'progress') {
                    isEmitEvent && this.emit('UpdateProgress', payload.data);
                }
                else {
                    this.workers.removeAllListeners(channel);
                    resolve(payload);
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
