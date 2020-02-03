import QZFile from "./core/file";
import QeTag from "./qetag/index";
import QeTagNormal from "./qetag/normal";
import QeTagWorker from "./qetag/worker";
import Http from "./http/index";
import HttpClient from "./http/xhr";
import WorkerClient from "./http/worker";
import WorkerProvider from "./worker";
import QeTagWorkerScript from './ws/qetag.bundle';
import uploaderWorkerScript from './ws/uploader.bundle';
import merge from 'lodash/merge';
import Chunk from "./core/chunk";
import { AxiosResponse } from "axios";

export enum STATUS {
    PENDING = 1,
    PREPARING,
    UPLOADING,
    CALCULATING,
    FAILED,
    DONE,
    CANCEL,
    PAUSE
}

export const TASK_STATUS_INFO = {
    [STATUS.PENDING]: '排队中...',
    [STATUS.PREPARING]: '准备中...',
    [STATUS.UPLOADING]: '上传中...',
    [STATUS.CALCULATING]: '计算中...',
    [STATUS.FAILED]: '上传失败',
    [STATUS.DONE]: '上传完成',
    [STATUS.CANCEL]: '取消上传',
    [STATUS.PAUSE]: '暂停上传'
};

export const UPLOADING_STATUS = {
    [STATUS.PREPARING]: 1,
    [STATUS.UPLOADING]: 1,
    [STATUS.CALCULATING]: 1
};

function sizeToStr(size: number): string {
    if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + 'KB';
    }
    if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + 'MB';
    }

    if (size < 1024 * 1024 * 1024 * 1024) {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
    }
    return '';
}

export type AdapterType = 'Normal' | 'Worker';

interface UplaodConfig {
    /**
     * adapter
     */
    adapter?: AdapterType;
    onStatusChange?: Function;
}

let qetagWorkers: WorkerProvider;
let uploaderWorkers: WorkerProvider;

export type TokenInfo = {
    identity?: string;
    uploadToken: string;
    uploadUrl: string;
    type: string;
    filePath: string;
};

export interface CreateFileResInfo {
    code?: string;
    response?: string;
    message?: string;
}

export type UploadedFileInfo = {
    children: any[];
    identity: string;
    hash: string;
    userIdentity: number;
    path: string;
    name: string;
    ext: string;
    size: string;
    mime: string;
    parent: string;
    type: number;
    directory: boolean;
    atime: number;
    ctime: number;
    mtime: number;
    version: number;
    locking: boolean;
    op: number;
    preview: boolean;
    previewType: number;
    flag: number;
    uniqueIdentity: string;
    share: boolean;
}

export interface TokenResult {
    uploadInfo?: TokenInfo;
    hashCached: boolean;
    file?: UploadedFileInfo;
};

export interface TokenResponse {
    status: number;
    result: TokenResult;
    code: string;
    success: boolean;
}

export interface BPutResponse{
    ctx: string;
    checksum: string;
    crc32: number;
    offset: number;
    code?: string;
    message?: string;
}

export type FileProps = {
    identity: string;
    override: boolean;
} | any;

export class WebFile {
    static default = {
        clientConfig: {
            baseURL: 'https://api.6pan.cn',
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json'
            }
        },
        apis: {
            token: '/v2/upload/token',
            mkblk: '/mkblk/',
            bput: '/bput/',
            mkfile: '/mkfile/'
        },
        AuthorizationTokenKey: 'qingzhen-token',
        AuthorizationStorageKey: 'user-authorization-token',
        chunkRetry: 3,
        blockSize: 4 * 1024 * 1024,
        chunkSize: 1 * 1024 * 1024,
        /**
         * for block upload
         */
        concurrency: 3,
        taskConcurrencyInWorkers: 3,
    };
    tryCount = 0;
    progress = 0;
    ctx: {
        length: number;
        [key: string]: any;
    } = {
        length: 0
    };
    lastProgress: {
        size: number;
        time: any;
    } = {
        time: null,
        size: 0
    };
    bytesPreSecond = 0;
    rate = '0KB/S';
    parent = '';
    props: FileProps;
    normalFile?: UploadedFileInfo;
    error: Error[] = [];
    public static config(config: any): void {
        WebFile.default = merge(WebFile.default, config);
    }
    http?: HttpClient | WorkerClient;
    file: QZFile;
    config: { adapter: AdapterType; onStatusChange: Function } & UplaodConfig;
    qetag?: QeTagNormal | QeTagWorker;
    hashCalcProgress = 0;
    status: STATUS = STATUS.PENDING;
    sizeStr: string;
    tokenInfo: TokenInfo = {
        uploadUrl: '',
        uploadToken: '',
        type: '',
        filePath: ''
    };
    pos: any[] = [];
    constructor (file: File, fileProps: FileProps = {}, config: UplaodConfig = {}) {
        this.props = Object.assign({
            identity: '',
            override: false
        }, fileProps);
        if (config.adapter) {
            if (!(config.adapter in QeTag)) {
                delete config.adapter
            }
        }
        
        this.config = Object.assign({
            adapter: 'Normal',
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onStatusChange: function () {}
        }, config);

        this.file = new QZFile({
            file,
            blockSize: WebFile.default.blockSize,
            chunkSize: WebFile.default.chunkSize
        });

        this.sizeStr = sizeToStr(this.file.size);
    }

    private _qetag(): QeTagNormal | QeTagWorker {
        if (!this.qetag) {
            if (!qetagWorkers && this.config.adapter === 'Worker') {
                qetagWorkers = new WorkerProvider(WorkerProvider.asyncFnMover(QeTagWorkerScript), WebFile.default.taskConcurrencyInWorkers);
            }
    
            this.qetag = new QeTag[this.config.adapter](this.file, {
                workers: qetagWorkers
            });
            this.qetag.on(QeTag.Base.Events.UpdateProgress, (progress: number) => {
                this.hashCalcProgress = progress;
                this.config.onStatusChange(this, this.status);
            })
        }
        return this.qetag;
    }

    public getHash(): Promise<string> {
        const qetag = this._qetag();
        if (qetag.isExist()) {
            return Promise.resolve(qetag.getSync());
        }
        return qetag.get({
            isTransferablesSupported: WorkerProvider.isTransferablesSupported(),
            isEmitEvent: true
        });
    }

    public getHashSync(): string {
        const qetag = this._qetag();
        return qetag.getSync();
    }

    public setHash(hash: string): void {
        const qetag = this._qetag();
        qetag.set(hash);
    }

    public get statusInfo(): string {
        return TASK_STATUS_INFO[this.status];
    }

    public isExisted(): boolean {
        if (this.tokenInfo) {
            if (this.tokenInfo.identity) {
                return true;
            }
        }
        return false;
    }

    private _http(): HttpClient | WorkerClient {
        if (!this.http) {
            if (!uploaderWorkers && this.config.adapter === 'Worker') {
                uploaderWorkers = new WorkerProvider(WorkerProvider.asyncFnMover(uploaderWorkerScript), WebFile.default.taskConcurrencyInWorkers);
            }
            this.http = new Http[this.config.adapter]({
                workers: uploaderWorkers
            });
            this.http.on(Http.Base.Events.UpdateProgress, (bytes: number) => {
                this.setProgress(bytes);
            })
        }
        return this.http;
    }

    private _getDefaultRequestHeader(): any {
        const { AuthorizationTokenKey, AuthorizationStorageKey } = WebFile.default;
        const token = localStorage.getItem(AuthorizationStorageKey);
        if (token) {
            return {
                headers: {
                    [AuthorizationTokenKey]: token
                }
            }
        }
        return {};
    }

    public async getTokenInfo(): Promise<TokenResult> {
        const http = this._http();
        const result = await http.post<TokenResponse>({
            url: WebFile.default.apis.token,
            data: {
                hash: this.getHashSync(),
                path: this.props.identity,
                name: this.file.name,
                override: this.props.override
            },
            config: merge({}, WebFile.default.clientConfig, this._getDefaultRequestHeader())
        })

        if (result.data.success) {
            return result.data.result;
        }
        throw new Error(result.data.code);
    }


    public markTry(tryNum?: number): void {
        if (tryNum) {
            this.tryCount = tryNum;
        }
        else {
            this.tryCount++;
        }
    }

    public setStatus(status: STATUS): void {
        this.status = status;
        switch (status) {
            case STATUS.CALCULATING:
                // todo
                break;
            case STATUS.CANCEL:
                if (this.http) {
                    this.http.removeAllListeners();
                }
                if (this.qetag) {
                    this.qetag.removeAllListeners();
                }
                break;
            case STATUS.DONE:
                this.progress = 100;
                if (this.http) {
                    this.http.removeAllListeners();
                }
                if (this.qetag) {
                    this.qetag.removeAllListeners();
                }
                break;
            case STATUS.FAILED:
                // todo
                break;
            case STATUS.PAUSE:
                this.tryCount = 0;
                break;
            case STATUS.PENDING:
                this.tryCount = 0;
                break;
            case STATUS.PREPARING:
                // todo
                break;
            case STATUS.UPLOADING:
                // todo
                break;
            default:
                break;
        }
        this.config.onStatusChange(this, this.status);
    }

    public getError(): Error[] {
        return this.error;
    }

    public setProgress(byte: number): void {
        const now = new Date().getTime();
        const { blockSize, chunkSize } = WebFile.default;
        const bytesUploading = this.pos
            .filter(pos => pos.status === STATUS.UPLOADING)
            .map(pos => this.ctx[pos.index])
            .filter(ctx => ctx && ctx.length)
            .map(ctx => ctx.length)
            .reduce((a, b) => a + b, 0) * chunkSize;
        const bytesUploaded = this.ctx.length * blockSize + bytesUploading + byte;
        
        if (this.lastProgress.time) {
            this.bytesPreSecond = Math.floor((bytesUploaded - this.lastProgress.size) / ((now - this.lastProgress.time) / 1000));
            this.rate = sizeToStr(this.bytesPreSecond) + '/S';
        }

        this.lastProgress = {
            time: now,
            size: bytesUploaded
        }

        this.progress = parseFloat((bytesUploaded * 100 / this.file.size).toFixed(2));

        if (this.bytesPreSecond > 0) {
            this.setStatus(STATUS.UPLOADING);
        }
    }

    public isUploading(): boolean {
        return this.status in UPLOADING_STATUS;
    }

    public isFailed(): boolean {
        return this.status === STATUS.FAILED;
    }

    public isDone(): boolean {
        return this.status === STATUS.DONE;
    }

    public isPending(): boolean {
        return this.status === STATUS.PENDING;
    }

    public isTryout(): boolean {
        return this.tryCount > WebFile.default.chunkRetry;
    }

    public isCancel(): boolean {
        return this.status === STATUS.CANCEL;
    }

    public isCalculating(): boolean {
        return this.status === STATUS.CALCULATING;
    }

    public isPreparing(): boolean {
        return this.status === STATUS.PREPARING;
    }

    public isPaused(): boolean {
        return this.status === STATUS.PAUSE;
    }

    public pause(): Promise<any> {
        if (this.isUploading()) {
            this.setStatus(STATUS.PAUSE);
            return Promise.resolve();
        }
        return Promise.reject(new Error(`Warning: Non-uploading`));
    }

    public resume(): Promise<any> {
        if (this.isPaused()) {
            return this.upload();
        }
        return Promise.reject(new Error(`Warning: Uploading`));
    }

    public cancel(): Promise<any> {
        this.setStatus(STATUS.CANCEL);
        return Promise.resolve();
    }

    public setFileInfo(info: TokenResult): void {
        if (info.file) {
            this.tokenInfo.identity = info.file.identity;
            this.normalFile = info.file;
        }
        else if (info.uploadInfo) {
            this.tokenInfo = info.uploadInfo;
        }
    }

    public async upload(): Promise<any> {
        if (this.isUploading()) {
            throw new Error(`Warning: Uploading`);
        }
        try {
            this.setStatus(STATUS.CALCULATING);
            await this.getHash();
            this.setStatus(STATUS.PREPARING);
            const tokenInfo = await this.getTokenInfo();
            this.setFileInfo(tokenInfo);
            if (this.isExisted()) {
                this.setStatus(STATUS.DONE);
                return;
            }
            if (this.isCancel()) {
                throw new Error(`Warning: Cancel upload`);
            }
            this.setStatus(STATUS.UPLOADING);
            this.start();
        }
        catch (e) {
            this.setStatus(STATUS.FAILED);
            this.recordError(e);
        }
    }

    public recordError(e: Error): void {
        this.error.push(e);
    }

    public async start(): Promise<any> {
        if (this.isDone()) {
            return;
        }
        if (this.isPaused()) {
            return;
        }

        try {
            if (this.isCancel()) {
                throw new Error(`Warning: Cancel upload`);
            }
            if (this.isTryout()) {
                throw new Error(`Warning: Upload Tryout`);
            }
        }
        catch (e) {
            this.setStatus(STATUS.FAILED);
            this.recordError(e);
            return;
        }
        
        try {
            if (this.ctx.length === this.file.getBlocks().length) {
                const { data }: any = await this.createFile();
                if (data.code) {
                    throw new Error(`Create: ${data.message}`);
                }
                if (data.hash !== this.getHashSync()) {
                    throw new Error(`Warning: File check failed`);
                }
                const uploadResult = JSON.parse(data.response).result as UploadedFileInfo;
                this.setNormalFile(uploadResult);
                this.setStatus(STATUS.DONE);
                return;
            }
            this.setPos();
            this.pos.filter(p => p.status === STATUS.PENDING).map(v => {
                v.status = STATUS.UPLOADING;
                this.blockStart(v);
            });
        }
        catch (e) {
            this.markTry();
            this.start();
            this.recordError(e);
            return;
        }
    }

    public setNormalFile(file: UploadedFileInfo): void {
        this.normalFile = file;
    }

    public createFile(): Promise<AxiosResponse<CreateFileResInfo>> {
        const http = this._http();
        const {
            clientConfig,
            apis
        } = WebFile.default;
        return http.post({
            url: apis.mkfile + this.file.size,
            data: Array.from(this.ctx).map(ctx => ctx[ctx.length - 1]).toString(),
            config: merge(
                {},
                clientConfig,
                {
                    baseURL: this.tokenInfo.uploadUrl,
                    headers: {
                        'Authorization': this.tokenInfo.uploadToken,
                        'UploadBatch': this.file.batch,
                        'Content-Type': 'text/plain;charset=UTF-8'
                    }
                }
            )
        })
    }

    public setPos(): void {
        let pos = Math.max.apply(null, this.pos.length ? this.pos.map(p => p.index) : [-1]);
        this.pos = this.pos.filter((pos) => pos.status !== STATUS.DONE);
        let len = WebFile.default.concurrency - this.pos.length;
        if (len < 0) {
            len = 0;
        }
        while (len) {
            pos++;
            if (this.file.getBlockByIndex(pos)) {
                this.pos.push({
                    index: pos,
                    status: STATUS.PENDING
                })
            }
            len--;
        }
    }

    private _orderTask(chunks: Chunk[]): Promise<any> {
        let promise: Promise<any> = Promise.resolve();

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            promise = promise
                .then((ctx: any) => this.chunkUpload(chunk, ctx))
                .then((res) => {
                    if (res.data.code) {
                        throw new Error(`Chunk: ${res.data.message}`);
                    }
                    this.setCtx(res.data.ctx, chunk)
                    return res.data.ctx;
                })
        }
        return promise
    }

    public async blockStart(info: any): Promise<any> {
        try {
            const block = this.file.getBlockByIndex(info.index);
            const chunks = block.getChunks();
            await this._orderTask(chunks);
            info.status = STATUS.DONE;
            this.start();
        }
        catch (e) {
            info.status = STATUS.PENDING;
            this.removeCtx(info.index);
            this.markTry();
            this.recordError(e);
            this.start();
        }
    }

    public removeCtx(index: number): void {
        delete this.ctx[index];
    }

    public setCtx(ctx: string, chunk: Chunk): void {
        if (chunk.index === 0) {
            this.ctx[chunk.block.index] = []
        }
        this.ctx[chunk.block.index][chunk.index] = ctx;
        if (this.ctx[chunk.block.index].length === chunk.block.getChunks().length) {
            this.ctx.length += 1;
        }
    }

    public chunkUpload(chunk: Chunk, ctx?: string): Promise<AxiosResponse<BPutResponse>> {
        const http = this._http();
        const {
            clientConfig,
            apis
        } = WebFile.default;
        const config = {
            url: '',
            data: chunk.blob,
            config: merge(
                {},
                clientConfig,
                {
                    baseURL: this.tokenInfo.uploadUrl,
                    headers: {
                        'Authorization': this.tokenInfo.uploadToken,
                        'UploadBatch': this.file.batch,
                        'Content-Type': 'application/octet-stream'
                    }
                }
            )
        };

        if (chunk.index === 0) {
            config.url = `${apis.mkblk}${chunk.block.size}/${chunk.block.index}`;
        }
        else {
            config.url = `${apis.bput}${ctx}/${chunk.startByte}`;
        }

        return http.post<BPutResponse>(config, {
            isTransferablesSupported: WorkerProvider.isTransferablesSupported(),
            isEmitEvent: true
        });
    }
}

