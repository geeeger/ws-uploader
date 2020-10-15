/* eslint-disable @typescript-eslint/ban-types */
import Status from "./core/status";
import HttpClient from "./http/xhr";
import WorkerClient from "./http/worker";
import QeTag from "./qetag/index";
import QeTagNormal from "./qetag/normal";
import QeTagWorker from "./qetag/worker";
import WorkerProvider from "./worker";
import QeTagWorkerScript from './qetag/worker-script';
import uploaderWorkerScript from './http/worker-script';
import QZFile from "./core/file";
import Http from "./http/index";
import { createThrottle, sizeToStr } from "./core/utils";
import { STATUS } from "./constants/status";
import Ctx from "./core/ctx";
import Chunk from "./core/chunk";
import { merge } from "./third-parts/merge";
import { HttpClientProps } from "./interface";

let qetagWorkers: WorkerProvider;
let uploaderWorkers: WorkerProvider;

export type AdapterType = 'Normal' | 'Worker';

export interface UplaodConfig {
    /**
     * adapter
     */
    adapter?: AdapterType;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onStatusChange?: Function;
}

export type FileProps = {
    path: string;
    parent: string;
    op: number;
};

export interface BPutResponse{
    ctx: string;
    checksum: string;
    crc32: number;
    offset: number;
    code?: string;
    message?: string;
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

export interface TokenInfo {
    uploadToken: string;
    createInfo: UploadedFileInfo;
    type: string;
    filePath: string;
    created: boolean;
    partUploadUrl: string;
    directUploadUrl: string;
}

export default class Service extends Status {
    /**
     * @description httpClient
     * @type {(HttpClient | WorkerClient)}
     * @memberof Service
     */
    http?: HttpClient | WorkerClient;

    /**
     * @description qeTag 计算工具
     * @type {(QeTagNormal | QeTagWorker)}
     * @memberof Service
     */
    qetag?: QeTagNormal | QeTagWorker;

    /**
     * @description 存储的file对象
     * @type {QZFile}
     * @memberof Service
     */
    file: QZFile;

    /**
     * @description 配置项
     * @type {{ adapter: AdapterType; onStatusChange: Function }}
     * @memberof Service
     */
    config: { adapter: AdapterType; onStatusChange: Function };

    /**
     * @description 文件属性
     * @type {FileProps}
     * @memberof Service
     */
    props: FileProps;

    /**
     * @description 文件上传进度属性
     * @memberof Service
     */
    progress = 0;
    
    /**
     * @description 文件大小 / 1.00MB
     * @type {string}
     * @memberof Service
     */
    sizeStr: string;

    /**
     * @description 提供能力以操作分片上传返回的ctx
     * @type {Ctx}
     * @memberof Service
     */
    ctx: Ctx;

    /**
     * @description hash计算进度
     * @memberof Service
     */
    hashCalcProgress = 0;

    /**
     * @description 已上传大小记录
     * @type {{
     *         size: number;
     *         time: any;
     *     }}
     * @memberof Service
     */
    lastProgress: {
        size: number;
        time: any;
    } = {
        time: null,
        size: 0
    };

    /**
     * @description 上传速率（format）
     * @memberof Service
     */
    rate = '0KB/S';

    /**
     * @description 上传速率
     * @memberof Service
     */
    bytesPreSecond = 0;

    /**
     * @description 上传需要的token信息
     * @type {TokenInfo}
     * @memberof Service
     */
    tokenInfo: TokenInfo = {
        uploadToken: "",
        createInfo: {} as UploadedFileInfo,
        type: "",
        filePath: "",
        created: false,
        partUploadUrl: "https://upload-v1.6pan.cn",
        directUploadUrl: "https://upload-v1.6pan.cn/file/upload"
    };

    /**
     * @description 上传完成返回的文件信息
     * @type {UploadedFileInfo}
     * @memberof Service
     */
    normalFile?: UploadedFileInfo;

    /**
     *Creates an instance of Service.
     * @param {File} file
     * @param {FileProps} [fileProps={} as FileProps]
     * @param {UplaodConfig} [config={}]
     * @memberof Service
     */
    constructor(file: File, fileProps: FileProps = {} as FileProps, config: UplaodConfig = {}) {
        super();
        
        this.file = new QZFile({
            file,
            blockSize: Service.default.blockSize,
            chunkSize: Service.default.chunkSize
        })
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
        this.sizeStr = sizeToStr(this.file.size);
        this.ctx = new Ctx()
        this._setStatusHandler();
    }

    /**
     * @description 用于判断是否在上传token期间获取到文件信息
     * @returns {boolean}
     * @memberof Service
     */
    isExisted(): boolean {
        if (this.normalFile) {
            return true;
        }
        return false;
    }

    /**
     * @description 设置文件信息或者token信息，判断token请求返回是否有created字段，如有，则设置文件信息
     * @param {TokenInfo} info
     * @memberof Service
     */
    setFileInfo(info: TokenInfo): void {
        if (info.created) {
            this.setNormalFile(info.createInfo)
        }
        else {
            this.tokenInfo = info
        }
    }

    /**
     * @description 直接设置接口返回的文件信息
     * @param {UploadedFileInfo} file
     * @memberof Service
     */
    setNormalFile(file: UploadedFileInfo): void {
        this.normalFile = file;
    }

    /**
     * @description 提供qetag服务（lazy）
     * @returns {(QeTagNormal | QeTagWorker)}
     * @memberof Service
     */
    _qetag(): QeTagNormal | QeTagWorker {
        if (!this.qetag) {
            if (!qetagWorkers && this.config.adapter === 'Worker') {
                qetagWorkers = new WorkerProvider(WorkerProvider.asyncFnMover(QeTagWorkerScript), Service.default.taskConcurrencyInWorkers);
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

    /**
     * @description 提供http服务（lazy）
     * @returns {(HttpClient | WorkerClient)}
     * @memberof Service
     */
    _http(): HttpClient | WorkerClient {
        if (!this.http) {
            if (!uploaderWorkers && this.config.adapter === 'Worker') {
                uploaderWorkers = new WorkerProvider(WorkerProvider.asyncFnMover(uploaderWorkerScript), Service.default.taskConcurrencyInWorkers);
            }
            this.http = new Http[this.config.adapter]({
                workers: uploaderWorkers
            });
            const throttle = createThrottle(1000)
            this.http.on(Http.Base.Events.UpdateProgress, () => {
                throttle(() => {
                    this.setProgress()
                });
            })
        }
        return this.http;
    }

    /**
     * @description 计算文件上传进度
     * @memberof Service
     */
    setProgress(): void {
        const now = new Date().getTime();
        const { chunkSize } = Service.default;
        const bytesUploaded = this.ctx.size * chunkSize;
        
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

    /**
     * @description 设置文件状态handler
     * @memberof Service
     */
    _setStatusHandler(): void {
        const onChange = () => {
            this.config.onStatusChange(this, this.status)
        }

        this.addStatusHandler(STATUS.CALCULATING, onChange)
            .addStatusHandler(STATUS.CANCEL, () => {
                this.http?.removeAllListeners();
                this.qetag?.emit('race-to-stop');
                this.qetag?.removeAllListeners();
                onChange()
            })
            .addStatusHandler(STATUS.DONE, () => {
                this.progress = 100;
                this.qetag?.removeAllListeners();
                onChange()
            })
            .addStatusHandler(STATUS.FAILED, onChange)
            .addStatusHandler(STATUS.PAUSE, () => {
                this.tryCount = 0;
                this.qetag?.emit('race-to-stop');
                onChange()
            })
            .addStatusHandler(STATUS.PENDING, () => {
                this.tryCount = 0;
                onChange()
            })
            .addStatusHandler(STATUS.PREPARING, onChange)
            .addStatusHandler(STATUS.UPLOADING, onChange)
    }

    /**
     * @description 提供片上传服务
     * @param {Chunk} chunk
     * @param {string} [ctx]
     * @returns {Promise<BPutResponse>}
     * @memberof Service
     */
    chunkUpload(chunk: Chunk, ctx?: string): Promise<BPutResponse> {
        const http = this._http();
        const {
            clientConfig,
            apis
        } = Service.default;
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

    /**
     * @description 提供创建文件服务
     * @returns {Promise<CreateFileResInfo>}
     * @memberof Service
     */
    createFile(): Promise<CreateFileResInfo> {
        const http = this._http();
        const {
            clientConfig,
            apis
        } = Service.default;
        return http.post<any>({
            url: this.tokenInfo.partUploadUrl + apis.mkfile + this.file.size,
            data: this.ctx.toString(),
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

    /**
     * @description 提供获取hash值服务
     * @param {Promise<string>} raceFunction
     * @returns {Promise<string>}
     * @memberof Service
     */
    getHash(raceFunction: Promise<string>): Promise<string> {
        const qetag = this._qetag();
        if (qetag.isExist()) {
            return Promise.resolve(qetag.getSync());
        }
        return qetag.get({
            isTransferablesSupported: WorkerProvider.isTransferablesSupported(),
            isEmitEvent: true
        }, raceFunction);
    }

    /**
     * @description 提供同步获取hash值服务
     * @returns {string}
     * @memberof Service
     */
    getHashSync(): string {
        const qetag = this._qetag();
        return qetag.getSync();
    }

    /**
     * @description 提供直接设置hash值服务
     * @param {string} hash
     * @memberof Service
     */
    setHash(hash: string): void {
        const qetag = this._qetag();
        qetag.set(hash);
    }

    /**
     * @description 生成携带Auth信息的请求头
     * @returns {*}
     * @memberof Service
     */
    _getDefaultRequestHeader(): any {
        const { AuthorizationTokenKey, AuthorizationStorageKey } = Service.default;
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

    /**
     * @description 请求并获取上传token信息
     * @returns {Promise<TokenInfo>}
     * @memberof Service
     */
    async getTokenInfo(): Promise<TokenInfo> {
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
            url: Service.default.clientConfig.baseURL + Service.default.apis.token,
            data: JSON.stringify(params),
            credentials: 'include',
            config: merge({}, Service.default.clientConfig, this._getDefaultRequestHeader())
        }).then(json => {
            if (json.success === false) {
                throw new Error(json.message)
            }
            return json
        })

        return result
    }
}