/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Interface from "../interface";
import { HttpClientProps } from "../interface";
import { guid } from '../core/utils';
import HttpClient from './base';

/**
 * @description xhr服务
 * @export
 * @class Http
 * @extends {HttpClient}
 * @implements {Interface.HttpClient}
 */
export default class Http extends HttpClient implements Interface.HttpClient {
    /**
     * 消息频道
     *
     * @type {string}
     * @memberof Http
     */
    public channel: string;

    /**
     * Creates an instance of Http.
     * @param {*} [_]
     * @memberof Http
     */
    constructor(_?: any) {
        super();
        this.channel = guid();
    }

    /**
     * 发送请求
     *
     * @template T
     * @param {HttpClientProps} props
     * @param {*} [{ isEmitEvent }={}]
     * @return {*}  {Promise<T>}
     * @memberof Http
     */
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