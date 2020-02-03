/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosResponse } from 'axios';
import Interface, { HttpClientProps } from '../../types/interface';
import { guid } from '../core/utils';
import HttpClient from './base';

export default class Http extends HttpClient implements Interface.HttpClient {
    public channel: string;

    constructor(_?: any) {
        super();
        this.channel = guid();
    }

    public post<T>(props: HttpClientProps, { isEmitEvent }: any = {}): Promise<AxiosResponse<T>> {
        return axios.post(props.url, props.data, {
            ...props.config,
            onUploadProgress: (e) => {
                isEmitEvent && this.emit(Http.Events.UpdateProgress, e.loaded);
            }
        }).finally(() => { 
            this.removeAllListeners(this.channel);
        });
    }
}