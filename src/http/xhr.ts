/* eslint-disable @typescript-eslint/no-unused-vars */
import Interface, { HttpClientProps } from '../../types/interface';
import { guid } from '../core/utils';
import HttpClient from './base';

export default class Http extends HttpClient implements Interface.HttpClient {
    public channel: string;

    constructor(_?: any) {
        super();
        this.channel = guid();
    }

    public post<T>(props: HttpClientProps, { isEmitEvent }: any = {}): Promise<T> {
        return fetch(props.url, {
            body: props.data,
            method: 'POST',
            mode: 'cors',
            credentials: props.credentials,
            headers: {
                ...(
                    props.config
                        ? props.config.headers
                            ? props.config.headers
                            : {}
                        : {}
                )
            }
        }).then(response => {
            return response.json()
        }).then(json => {
            isEmitEvent && this.emit(Http.Events.UpdateProgress, (props.data as Blob).size)
            this.removeAllListeners(this.channel)
            return json
        })
    }
}