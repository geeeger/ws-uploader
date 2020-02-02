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

const UPLOADING_STATUS = {
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
    file?: UploadedFileInfo
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
        chunkRetry: 3,
        blockSize: 4 * 1024 * 1024,
        chunkSize: 1 * 1024 * 1024,
        /**
         * for block upload
         */
        concurrency: 3,
        taskConcurrencyInWorkers: 3,
    };
    tryCount: number = 0;
    progress: number = 0;
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
    bytesPreSecond: number = 0;
    rate: string = '0KB/S';
    parent: string = '';
    props: FileProps;
    normalFile?: UploadedFileInfo;
    error: Error | undefined;
    static config(config: any) {
        WebFile.default = merge(WebFile.default, config);
    }
    http?: HttpClient | WorkerClient;
    file: QZFile;
    config: { adapter: AdapterType; onStatusChange: Function } & UplaodConfig;
    qetag?: QeTagNormal | QeTagWorker;
    hashCalcProgress: number = 0;
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
            onStatusChange: () => {}
        }, config);

        this.file = new QZFile({
            file,
            blockSize: WebFile.default.blockSize,
            chunkSize: WebFile.default.chunkSize
        });

        this.sizeStr = sizeToStr(this.file.size);
    }

    private _qetag() {
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

    getHash(): Promise<string> {
        const qetag = this._qetag();
        if (qetag.isExist()) {
            return Promise.resolve(qetag.getSync());
        }
        return qetag.get({
            isTransferablesSupported: WorkerProvider.isTransferablesSupported(),
            isEmitEvent: true
        });
    }

    getHashSync(): string {
        const qetag = this._qetag();
        return qetag.getSync();
    }

    setHash(hash: string) {
        const qetag = this._qetag();
        qetag.set(hash);
    }

    get statusInfo(): string {
        return TASK_STATUS_INFO[this.status];
    }

    isExisted() {
        if (this.tokenInfo) {
            if (this.tokenInfo.identity) {
                return true;
            }
        }
        return false;
    }

    private _http() {
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

    private _getDefaultRequestHeader() {
        const key = WebFile.default.AuthorizationTokenKey;
        const token = localStorage.getItem(key);
        if (token) {
            return {
                headers: {
                    [key]: token
                }
            }
        }
        return {};
    }

    async getTokenInfo() {
        const http = this._http();
        const { data } = await http.post<TokenResponse>({
            url: WebFile.default.apis.token,
            data: {
                hash: this.getHashSync(),
                path: this.parent,
                name: this.file.name,
                override: this.props.override
            },
            config: merge({}, WebFile.default.clientConfig, this._getDefaultRequestHeader())
        })

        if (data.success) {
            return data.result;
        }

        throw new Error(data.code);
    }


    markTry(tryNum?: number) {
        if (tryNum) {
            this.tryCount = tryNum;
        }
        else {
            this.tryCount++;
        }
    }

    setStatus(status: STATUS, e?: Error) {
        this.status = status;
        if (status === STATUS.PENDING) {
            this.tryCount = 0;
        }
        if (status === STATUS.DONE) {
            this.progress = 100;
            this.http && this.http.removeAllListeners();
            this.qetag && this.qetag.removeAllListeners();
        }
        if (status === STATUS.FAILED) {
            this.error = e;
        }
        this.config.onStatusChange(this, this.status);
    }

    getError() {
        if (this.isFailed()) {
            return this.error;
        }
        return null;
    }

    setProgress(byte: number) {
        let now = new Date().getTime();
        let bytesUploaded = this.ctx.length * WebFile.default.chunkSize + byte;
        
        if (this.lastProgress.time) {
            this.bytesPreSecond = Math.floor((bytesUploaded - this.lastProgress.size) / ((now - this.lastProgress.time) / 1000));
            this.rate = sizeToStr(this.bytesPreSecond) + '/S';
        }

        this.lastProgress = {
            time: now,
            size: bytesUploaded
        }

        this.progress = (bytesUploaded / this.file.size) * 100;
    }

    isUploading() {
        return this.status in UPLOADING_STATUS;
    }

    isFailed() {
        return this.status === STATUS.FAILED;
    }

    isDone() {
        return this.status === STATUS.DONE;
    }

    isPending() {
        return this.status === STATUS.PENDING;
    }

    isTryout() {
        return this.tryCount > WebFile.default.chunkRetry;
    }

    isCancel() {
        return this.status === STATUS.CANCEL;
    }

    isCalculating() {
        return this.status === STATUS.CALCULATING;
    }

    isPreparing() {
        return this.status === STATUS.PREPARING;
    }

    isPaused() {
        return this.status === STATUS.PAUSE;
    }

    pause(): Promise<any> {
        if (this.isUploading()) {
            this.setStatus(STATUS.PAUSE);
            return Promise.resolve();
        }
        return Promise.reject(new Error(`Warning: Non-uploading`));
    }

    resume(): Promise<any> {
        if (this.isPaused()) {
            this.setStatus(STATUS.UPLOADING);
            return this.upload();
        }
        return Promise.reject(new Error(`Warning: Uploading`));
    }

    cancel(): Promise<any> {
        this.setStatus(STATUS.CANCEL);
        return Promise.resolve();
    }

    setFileInfo(info: TokenResult) {
        if (info.file) {
            this.tokenInfo.identity = info.file.identity;
            this.normalFile = info.file;
        }
        else if (info.uploadInfo) {
            this.tokenInfo = info.uploadInfo;
        }
    }

    async upload(): Promise<any> {
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
            this.start();
            this.setStatus(STATUS.UPLOADING);
        }
        catch (e) {
            this.setStatus(STATUS.FAILED, e);
        }
    }

    async start(): Promise<any> {
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
            this.setStatus(STATUS.FAILED, e);
            return;
        }
        
        try {
            if (this.ctx.length === this.file.getBlocks().length) {
                const { data }: any = await this.createFile();
                if (data.code) {
                    throw new Error(data.message);
                }
                if (data.hash !== this.getHashSync()) {
                    throw new Error(`Warning: File check failed`);
                }
                const uploadResult = JSON.parse(data.response).result as UploadedFileInfo;
                this.setNormalFile(uploadResult);
                this.setStatus(STATUS.DONE);
                return;
            }
        }
        catch (e) {
            this.markTry();
            this.start();
            return;
        }
        this.setPos();
        this.pos.map(v => {
            this.blockStart(v);
        })
    }

    setNormalFile(file: UploadedFileInfo) {
        this.normalFile = file;
    }

    createFile() {
        const http = this._http();
        const {
            clientConfig,
            apis
        } = WebFile.default;
        return http.post({
            url: apis.mkfile + this.file.size,
            data: Array.from(this.ctx).toString(),
            config: merge(
                {},
                clientConfig,
                {
                    headers: {
                        'Authorization': this.tokenInfo.uploadToken,
                        'UploadBatch': this.file.batch,
                        'Content-Type': 'text/plain;charset=UTF-8'
                    }
                }
            )
        })
    }

    setPos() {
        let pos = Math.max.apply(null, this.pos);
        this.pos = this.pos.filter((pos) => pos.status !== STATUS.DONE);
        let len = WebFile.default.concurrency - this.pos.length;
        while (len) {
            pos++;
            if (this.file.getBlockByIndex(pos)) {
                this.pos.push({
                    index: pos,
                    status: STATUS.PENDING,
                    try: 0
                })
            }
            len--;
        }
    }

    async blockStart(info: any) {
        if (info.try > WebFile.default.chunkRetry) {
            this.markTry(Infinity);
            this.start();
            return;
        }
        info.status = STATUS.UPLOADING;
        const block = this.file.getBlockByIndex(info.index);
        const chunks = block.getChunks();
        try {
            let result = await this.chunkUpload(chunks[0]);

            if (result.data.code) {
                throw new Error(result.data.message);
            }

            for (let i = 1; i < chunks.length; i++) {
                result = await this.chunkUpload(chunks[i], result.data.ctx);
                if (result.data.code) {
                    throw new Error(result.data.message);
                }
            }

            this.setCtx(result.data.ctx, chunks[chunks.length - 1]);

            info.status = STATUS.DONE;
        }
        catch (e) {
            info.status = STATUS.PENDING;
            info.try++;
            this.blockStart(info);
            return;
        }

        this.start();
    }

    setCtx(ctx: string, chunk: Chunk) {
        this.ctx[chunk.block.index] = ctx;
        this.ctx.length += 1;
    }

    chunkUpload(chunk: Chunk, ctx?: string) {
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
                this._getDefaultRequestHeader(),
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

