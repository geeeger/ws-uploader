import Chunk from "./core/chunk";
import { STATUS } from './constants/status';
import Service, { FileProps, UploadedFileInfo } from './service';

export { STATUS, TASK_STATUS_INFO, UPLOADING_STATUS } from './constants/status';

export type AdapterType = 'Normal' | 'Worker';

interface UplaodConfig {
    /**
     * adapter
     */
    adapter?: AdapterType;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onStatusChange?: Function;
}

export class WebFile extends Service {
    pos: any[] = [];
    constructor (file: File, fileProps: FileProps = {} as FileProps, config: UplaodConfig = {}) {
        super(file, fileProps, config);
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

    public cancel(): Promise<any> {
        this.setStatus(STATUS.CANCEL);
        return Promise.resolve();
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
            if (this.ctx.size === this.file.getChunksSize()) {
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
                    this.ctx.add(res.ctx, chunk);
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
            this.ctx.remove(info.index);
            this.markTry();
            this.start();
        }
    }
}

