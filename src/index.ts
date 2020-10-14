import { HttpClientProps } from './interface';
import QZFile from "./core/file";
import QeTag from "./qetag/index";
import QeTagNormal from "./qetag/normal";
import QeTagWorker from "./qetag/worker";
import Http from "./http/index";
import HttpClient from "./http/xhr";
import WorkerClient from "./http/worker";
import WorkerProvider from "./worker/index";
import QeTagWorkerScript from './qetag/worker-script';
import uploaderWorkerScript from './http/worker-script';
import merge from './third-parts/merge';
import Chunk from "./core/chunk";
import { createThrottle } from "./core/utils";

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
    // eslint-disable-next-line @typescript-eslint/ban-types
    onStatusChange?: Function;
}

let qetagWorkers: WorkerProvider;
let uploaderWorkers: WorkerProvider;

export interface TokenInfo {
    uploadToken: string;
    createInfo: UploadedFileInfo;
    type: string;
    filePath: string;
    created: boolean;
    partUploadUrl: string;
    directUploadUrl: string;
}

export interface CreateFileResInfo {
    code?: string;
    hash: string;
    response?: string;
    message?: string;
}

export interface UploadedFileInfo {
    identity: string;
    hash: string;
    userIdentity: string;
    path: string;
    name: string;
    ext: string;
    size: string;
    mime: string;
    deleted: boolean;
    parent: string;
    type: number;
    directory: boolean;
    atime: string;
    ctime: string;
    mtime: string;
    version: number;
    locking: boolean;
    op: number;
    preview: boolean;
    previewType: number;
    flag: number;
    uniqueIdentity: string;
    share: boolean;
    downloadAddress: string;
    unlockTime: string;
}

// export interface TokenResult {
//     uploadInfo?: TokenInfo;
//     hashCached: boolean;
//     file?: UploadedFileInfo;
// };

// export type TokenResult = TokenInfo | UploadedFileInfo;

// export interface TokenResponse {
//     status: number;
//     result: TokenResult;
//     code: string;
//     success: boolean;
// }

export interface BPutResponse{
    ctx: string;
    checksum: string;
    crc32: number;
    offset: number;
    code?: string;
    message?: string;
}

export type FileProps = {
    path: string;
    parent: string;
    op: number;
} | any;

export class WebFile {
    static default = {
        clientConfig: {
            baseURL: 'https://api.6pan.cn',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        apis: {
            token: '/v3/file/uploadToken',
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
    // eslint-disable-next-line @typescript-eslint/ban-types
    config: { adapter: AdapterType; onStatusChange: Function } & UplaodConfig;
    qetag?: QeTagNormal | QeTagWorker;
    hashCalcProgress = 0;
    status: STATUS = STATUS.PENDING;
    sizeStr: string;
    tokenInfo: TokenInfo = {
        uploadToken: "",
        createInfo: {} as UploadedFileInfo,
        type: "",
        filePath: "",
        created: false,
        partUploadUrl: "https://upload-v1.6pan.cn",
        directUploadUrl: "https://upload-v1.6pan.cn/file/upload"
    };
    pos: any[] = [];
    constructor (file: File, fileProps: FileProps = {}, config: UplaodConfig = {}) {
        this.props = fileProps;
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

    public getHash(raceFunction: Promise<string>): Promise<string> {
        const qetag = this._qetag();
        if (qetag.isExist()) {
            return Promise.resolve(qetag.getSync());
        }
        return qetag.get({
            isTransferablesSupported: WorkerProvider.isTransferablesSupported(),
            isEmitEvent: true
        }, raceFunction);
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
        if (this.normalFile) {
            return true;
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
            const throttle = createThrottle(1000)
            this.http.on(Http.Base.Events.UpdateProgress, (bytes: number) => {
                throttle(() => {
                    this.setProgress(bytes)
                });
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

    public async getTokenInfo(): Promise<TokenInfo> {
        const http = this._http();

        const params: {
            [key: string]: any;
        } = {
            hash: this.getHashSync(),
            name: this.file.name,
            op: this.props.op || 0
        }

        if (this.props.path) {
            params.path = this.props.path
        }

        if (this.props.parent) {
            params.parent = this.props.parent
        }
        const result = await http.post<any>({
            url: WebFile.default.clientConfig.baseURL + WebFile.default.apis.token,
            data: JSON.stringify(params),
            credentials: 'include',
            config: merge({}, WebFile.default.clientConfig, this._getDefaultRequestHeader())
        }).then(json => {
            if (json.success === false) {
                throw new Error(json.message)
            }
            return json
        })

        return result
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
        const qetag = this._qetag();
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
                qetag.emit('race-to-stop');
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
                qetag.emit('race-to-stop');
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public setProgress(byte: number): void {
        const now = new Date().getTime();
        const { chunkSize } = WebFile.default;
        // const bytesUploading = this.pos
        //     .filter(pos => pos.status === STATUS.UPLOADING)
        //     .map(pos => this.ctx[pos.index])
        //     .filter(ctx => ctx && ctx.length)
        //     .map(ctx => ctx.length)
        //     .reduce((a, b) => a + b, 0) * chunkSize;
        const bytesUploading = Object.keys(this.ctx)
            .map(index => {
                const ctx = this.ctx[index]
                if (ctx && ctx.length) {
                    return ctx.length
                }
                return 0
            }).reduce((a, b) => a + b, 0)
        const bytesUploaded = bytesUploading * chunkSize;
        
        if (this.lastProgress.time) {
            this.bytesPreSecond = Math.floor((bytesUploaded - this.lastProgress.size) / ((now - this.lastProgress.time) / 1000));
            this.rate = sizeToStr(this.bytesPreSecond) + '/S';
        }

        this.lastProgress = {
            time: now,
            size: bytesUploaded
        }

        let progress = parseFloat((bytesUploaded * 100 / this.file.size).toFixed(2));

        if (progress > 100) {
            progress = 100
        }

        this.progress = progress

        if (
            this.bytesPreSecond >= 0 &&
            this.isUploading()
        ) {
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
        if (this.isFailed()) {
            this.restTryCount();
            return this.upload();
        }
        if (this.isPaused()) {
            return this.upload();
        }
        if (this.isCancel()) {
            return Promise.reject(new Error(`Error: Uploader destoryed`))
        }
        return Promise.reject(new Error(`Warning: Uploading`));
    }

    public restTryCount(): void {
        this.tryCount = 0
    }

    public cancel(): Promise<any> {
        this.setStatus(STATUS.CANCEL);
        return Promise.resolve();
    }

    public setFileInfo(info: TokenInfo): void {
        if (info.created) {
            this.setNormalFile(info.createInfo)
        }
        else {
            this.tokenInfo = info
        }
    }

    public async upload(): Promise<any> {
        if (this.isUploading()) {
            throw new Error(`Warning: Uploading`);
        }
        try {
            this.setStatus(STATUS.CALCULATING);
            const qetag = this._qetag()
            qetag.removeAllListeners('race-to-stop')
            let resolveRefs: any;
            qetag.on('race-to-stop', () => {
                resolveRefs && resolveRefs('race-to-stop')
            })
            await this.getHash(new Promise((resolve) => {
                resolveRefs = resolve
            }));
            if (qetag.getSync() === 'race-to-stop') {
                qetag.set('')
                return;
            }
            this.setStatus(STATUS.PREPARING);
            const result = await this.getTokenInfo();
            this.setFileInfo(result);
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
            this.recordError(e);
            this.setStatus(STATUS.FAILED);
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
            this.recordError(e);
            this.setStatus(STATUS.FAILED);
            return;
        }
        
        try {
            if (this.ctx.length === this.file.getBlocks().length) {
                const data = await this.createFile();
                if (data.code) {
                    throw new Error(`Create: ${data.message}`);
                }
                const res = JSON.parse(data.response as string) as UploadedFileInfo;
                if (res.hash !== this.getHashSync()) {
                    throw new Error(`Warning: File check failed`);
                }
                this.setNormalFile(res);
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
            this.recordError(e);
            this.markTry();
            this.start();
            return;
        }
    }

    public setNormalFile(file: UploadedFileInfo): void {
        this.normalFile = file;
    }

    public createFile(): Promise<CreateFileResInfo> {
        const http = this._http();
        const {
            clientConfig,
            apis
        } = WebFile.default;
        return http.post<any>({
            url: this.tokenInfo.partUploadUrl + apis.mkfile + this.file.size,
            data: Array.from(this.ctx).map(ctx => ctx[ctx.length - 1]).toString(),
            credentials: 'omit',
            config: merge(
                {},
                clientConfig,
                {
                    baseURL: this.tokenInfo.partUploadUrl,
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
                    if (res.code) {
                        throw new Error(`Chunk: ${res.message}`);
                    }
                    this.setCtx(res.ctx, chunk)
                    return res.ctx;
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
            this.recordError(e);
            this.removeCtx(info.index);
            this.markTry();
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

    public chunkUpload(chunk: Chunk, ctx?: string): Promise<BPutResponse> {
        const http = this._http();
        const {
            clientConfig,
            apis
        } = WebFile.default;
        const config = {
            url: '',
            data: chunk.blob,
            credentials: 'omit',
            config: merge(
                {},
                clientConfig,
                {
                    baseURL: this.tokenInfo.partUploadUrl,
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

        config.url = this.tokenInfo.partUploadUrl + config.url;

        return http.post<any>(config as HttpClientProps, {
            isTransferablesSupported: WorkerProvider.isTransferablesSupported(),
            isEmitEvent: true
        })
    }
}

